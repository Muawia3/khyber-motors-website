import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const publicDir = path.join(__dirname, '../../public');

// Helper to locate a file across potential directories safely, with DB fallback
async function findFileOnDiskOrDb(targetPath) {
  if (!targetPath) return null;

  // Clean path
  const decoded = decodeURIComponent(targetPath);
  const cleanRelative = decoded.replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  const base = path.basename(cleanRelative);
  
  // 1. Direct path inside public/
  const directPath = path.join(publicDir, cleanRelative);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // 2. Search by basename in common storage folders
  const searchLocations = [
    path.join(publicDir, 'uploads', 'images', base),
    path.join(publicDir, 'uploads', 'brochures', base),
    path.join(publicDir, 'uploads', base),
    path.join(publicDir, 'brochures', base),
    path.join('/tmp', 'uploads', 'images', base),
    path.join('/tmp', 'uploads', 'brochures', base),
    path.join('/tmp', 'uploads', base),
    path.join('/tmp', base),
  ];

  for (const loc of searchLocations) {
    if (fs.existsSync(loc) && fs.statSync(loc).isFile()) {
      return loc;
    }
  }

  // 3. Database Fallback for Vercel multi-instance lambda persistence
  try {
    const dbRecord = await prisma.uploadedFile.findFirst({
      where: {
        OR: [
          { filename: base },
          { filename: cleanRelative },
          { url: { contains: base } },
        ],
      },
    });

    if (dbRecord && dbRecord.data) {
      const isPdf = dbRecord.mimeType === 'application/pdf' || base.toLowerCase().endsWith('.pdf');
      const cacheDir = path.join('/tmp', 'uploads', isPdf ? 'brochures' : 'images');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      const restoredPath = path.join(cacheDir, base);
      const buffer = Buffer.from(dbRecord.data, 'base64');
      fs.writeFileSync(restoredPath, buffer);
      return restoredPath;
    }
  } catch (err) {
    console.warn(`DB storage lookup warning for ${base}:`, err.message);
  }

  return null;
}

// Helper for MIME type lookup
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

// 1. GET /api/files/images/:filename
router.get('/images/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const dbRecord = await prisma.uploadedFile.findFirst({
      where: {
        OR: [{ filename }, { url: { contains: filename } }],
      },
      select: { url: true },
    });
    if (dbRecord && dbRecord.url && (dbRecord.url.startsWith('http://') || dbRecord.url.startsWith('https://'))) {
      return res.redirect(302, dbRecord.url);
    }
  } catch (err) {
    // Continue fallback to disk/db buffer
  }

  const filePath = await findFileOnDiskOrDb(`uploads/images/${filename}`);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      error: `Image file "${filename}" was not found on persistent server storage.`,
    });
  }

  const mimeType = getMimeType(filePath);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
  return res.sendFile(filePath);
});

// 2. GET /api/files/brochures/:filename
router.get('/brochures/:filename', async (req, res) => {
  const filename = req.params.filename;

  try {
    const dbRecord = await prisma.uploadedFile.findFirst({
      where: {
        OR: [{ filename }, { url: { contains: filename } }],
      },
      select: { url: true },
    });
    if (dbRecord && dbRecord.url && (dbRecord.url.startsWith('http://') || dbRecord.url.startsWith('https://'))) {
      return res.redirect(302, dbRecord.url);
    }
  } catch (err) {
    // Continue fallback to disk/db buffer
  }

  const filePath = await findFileOnDiskOrDb(`uploads/brochures/${filename}`);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      error: `Brochure PDF file "${filename}" was not found on persistent server storage.`,
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.sendFile(filePath);
});

// 3. GET /api/files/download/:filename or /api/files/download?file=...&name=...
router.get(['/download/:filename', '/download'], async (req, res) => {
  const fileParam = req.params.filename || req.query.file;
  if (!fileParam) {
    return res.status(400).json({ success: false, error: 'File parameter is required.' });
  }

  const filePath = await findFileOnDiskOrDb(fileParam);
  if (!filePath) {
    const base = path.basename(fileParam);
    return res.status(404).json({
      success: false,
      error: `Requested file "${base}" for download was not found on server.`,
    });
  }

  const downloadName = req.query.name || path.basename(filePath);
  const mimeType = getMimeType(filePath);

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  return res.sendFile(filePath);
});

// 4. Fallback handler for any /uploads/* request
export async function handleUploadsStaticServing(req, res, next) {
  const cleanUrl = req.path;
  const filePath = await findFileOnDiskOrDb(cleanUrl);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      error: `Uploaded asset "${req.path}" not found on server disk.`,
    });
  }

  const mimeType = getMimeType(filePath);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (mimeType === 'application/pdf') {
    if (req.query.download === 'true') {
      const downloadName = req.query.name || path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }
  } else {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }

  return res.sendFile(filePath);
}

export default router;
