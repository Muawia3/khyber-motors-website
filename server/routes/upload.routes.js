import express from 'express';
import path from 'path';
import { upload } from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

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
router.post('/single', authMiddleware, handleUploadSingle, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const fileUrl = getUrlForFile(req.file);
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
router.post('/multiple', authMiddleware, handleUploadMultiple, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded.' });
    }

    const files = req.files.map((file) => {
      const url = getUrlForFile(file);
      return {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
      };
    });

    return res.json({ success: true, count: files.length, data: files });
  } catch (error) {
    console.error('Upload multiple route error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
