import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const publicDir = path.join(__dirname, '../../public');

// Helper to locate a file across potential directories safely
function findFileOnDisk(targetPath) {
  if (!targetPath) return null;

  // Clean path
  const decoded = decodeURIComponent(targetPath);
  const cleanRelative = decoded.replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  
  // 1. Direct path inside public/
  const directPath = path.join(publicDir, cleanRelative);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    return directPath;
  }

  // 2. Search by basename in common storage folders
  const base = path.basename(cleanRelative);
  const searchLocations = [
    path.join(publicDir, 'uploads', 'images', base),
    path.join(publicDir, 'uploads', 'brochures', base),
    path.join(publicDir, 'uploads', base),
    path.join(publicDir, 'brochures', base),
  ];

  for (const loc of searchLocations) {
    if (fs.existsSync(loc) && fs.statSync(loc).isFile()) {
      return loc;
    }
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
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = findFileOnDisk(`uploads/images/${filename}`);

  if (!filePath) {
    return res.status(404).json({
      success: false,
      error: `Image file "${filename}" was not found on persistent server storage.`,
    });
  }

  const mimeType = getMimeType(filePath);
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(filePath);
});

// 2. GET /api/files/brochures/:filename
router.get('/brochures/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = findFileOnDisk(`uploads/brochures/${filename}`);

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
router.get(['/download/:filename', '/download'], (req, res) => {
  const fileParam = req.params.filename || req.query.file;
  if (!fileParam) {
    return res.status(400).json({ success: false, error: 'File parameter is required.' });
  }

  const filePath = findFileOnDisk(fileParam);
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
export function handleUploadsStaticServing(req, res, next) {
  const cleanUrl = req.path;
  const filePath = findFileOnDisk(cleanUrl);

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
