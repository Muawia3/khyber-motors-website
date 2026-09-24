import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

async function processFileAndGetUrl(file) {
  let finalUrl = null;
  const isPdf = file.mimetype === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf');

  // 1. Primary: Upload to Cloudinary for instant global CDN hosting
  try {
    const cloudRes = await uploadToCloudinary(file.path, {
      filename: file.originalname || file.filename,
    });
    if (cloudRes && cloudRes.url) {
      finalUrl = cloudRes.url;
    }
  } catch (err) {
    console.warn(`Cloudinary upload notice for ${file.filename}: ${err.message}. Falling back to local server URL.`);
  }

  // Fallback relative server URL if Cloudinary is offline or unconfigured
  if (!finalUrl) {
    finalUrl = isPdf
      ? `/api/files/brochures/${file.filename}`
      : `/api/files/images/${file.filename}`;
  }

  // 2. Persist metadata into database (avoid storing large base64 strings when Cloudinary is hosting)
  try {
    let base64Data = null;
    let size = file.size || 0;
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      size = stats.size;
      // Only keep base64 fallback for small non-Cloudinary local files (< 500KB)
      if (!finalUrl.startsWith('http') && size < 500 * 1024) {
        const buffer = fs.readFileSync(file.path);
        base64Data = buffer.toString('base64');
      }
    }

    await prisma.uploadedFile.upsert({
      where: { filename: file.filename },
      update: {
        url: finalUrl,
        mimeType: file.mimetype || 'application/octet-stream',
        size,
        data: base64Data,
      },
      create: {
        filename: file.filename,
        url: finalUrl,
        mimeType: file.mimetype || 'application/octet-stream',
        size,
        data: base64Data,
      },
    });
  } catch (dbErr) {
    console.warn(`Failed to save ${file.filename} DB record:`, dbErr.message);
  }

  return finalUrl;
}

function handleUploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer single upload error:', err.message);
      return res.status(400).json({ success: false, error: err.message || 'File upload error.' });
    }
    next();
  });
}

function handleUploadMultiple(req, res, next) {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer multiple upload error:', err.message);
      return res.status(400).json({ success: false, error: err.message || 'Multiple file upload error.' });
    }
    next();
  });
}

// POST /api/upload/single (Admin protected)
router.post('/single', authMiddleware, handleUploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const fileUrl = await processFileAndGetUrl(req.file);

    return res.json({
      success: true,
      url: fileUrl,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Upload single route error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/upload/multiple (Admin protected)
router.post('/multiple', authMiddleware, handleUploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded.' });
    }

    const files = [];
    for (const file of req.files) {
      const url = await processFileAndGetUrl(file);
      files.push({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
      });
    }

    return res.json({ success: true, count: files.length, data: files });
  } catch (error) {
    console.error('Upload multiple route error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/upload/chunk (Handles large files of ANY size by uploading in 2MB chunks)
router.post('/chunk', authMiddleware, async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, filename, chunkData, fileType } = req.body;

    if (!uploadId || chunkIndex === undefined || !filename || !chunkData) {
      return res.status(400).json({ success: false, error: 'Missing required chunk upload parameters.' });
    }

    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseDir = isServerless ? path.join('/tmp', 'uploads') : path.join(__dirname, '../../public/uploads');
    const isPdf = fileType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
    const subFolder = isPdf ? 'brochures' : 'images';
    const targetDir = path.join(baseDir, subFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFilename = `${uploadId}-${safeFilename}`;
    const finalFilePath = path.join(targetDir, storedFilename);

    // Decode base64 chunk buffer
    const base64Clean = chunkData.replace(/^data:.*?;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    // On first chunk, overwrite if exists; on subsequent chunks, append
    if (Number(chunkIndex) === 0) {
      fs.writeFileSync(finalFilePath, buffer);
    } else {
      fs.appendFileSync(finalFilePath, buffer);
    }

    const isLastChunk = Number(chunkIndex) === Number(totalChunks) - 1;

    if (isLastChunk) {
      const mockFile = {
        filename: storedFilename,
        originalname: filename,
        mimetype: fileType || (isPdf ? 'application/pdf' : 'image/jpeg'),
        path: finalFilePath,
        size: fs.existsSync(finalFilePath) ? fs.statSync(finalFilePath).size : 0,
      };

      const finalUrl = await processFileAndGetUrl(mockFile);

      return res.json({
        success: true,
        completed: true,
        url: finalUrl,
        filename: storedFilename,
      });
    }

    return res.json({
      success: true,
      completed: false,
      chunkIndex: Number(chunkIndex),
      totalChunks: Number(totalChunks),
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

