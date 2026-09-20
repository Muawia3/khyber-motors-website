import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

async function saveFileToDatabase(filename, url, mimeType, filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const base64Data = buffer.toString('base64');
      const stats = fs.statSync(filePath);

      await prisma.uploadedFile.upsert({
        where: { filename },
        update: {
          url,
          mimeType: mimeType || 'application/octet-stream',
          size: stats.size,
          data: base64Data,
        },
        create: {
          filename,
          url,
          mimeType: mimeType || 'application/octet-stream',
          size: stats.size,
          data: base64Data,
        },
      });
    }
  } catch (err) {
    console.warn(`Failed to save ${filename} to database storage:`, err.message);
  }
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

function getUrlForFile(file) {
  const isPdf = file.mimetype === 'application/pdf' || file.filename.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    return `/api/files/brochures/${file.filename}`;
  }
  return `/api/files/images/${file.filename}`;
}

// POST /api/upload/single (Admin protected)
router.post('/single', authMiddleware, handleUploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const fileUrl = getUrlForFile(req.file);
    await saveFileToDatabase(req.file.filename, fileUrl, req.file.mimetype, req.file.path);

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
      const url = getUrlForFile(file);
      await saveFileToDatabase(file.filename, url, file.mimetype, file.path);
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
      const relativeUrl = isPdf
        ? `/api/files/brochures/${storedFilename}`
        : `/api/files/images/${storedFilename}`;

      await saveFileToDatabase(storedFilename, relativeUrl, fileType || (isPdf ? 'application/pdf' : 'image/jpeg'), finalFilePath);

      return res.json({
        success: true,
        completed: true,
        url: relativeUrl,
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
