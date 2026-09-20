import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent vs Serverless Writable Storage Paths (/tmp for Vercel / AWS Lambda)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const baseUploadDir = isServerless
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../../public/uploads');

const imagesUploadDir = path.join(baseUploadDir, 'images');
const brochuresUploadDir = path.join(baseUploadDir, 'brochures');

// Ensure upload directories exist
[baseUploadDir, imagesUploadDir, brochuresUploadDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`Upload dir creation warning (${dir}):`, err.message);
  }
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Re-verify directory exists before saving
    [baseUploadDir, imagesUploadDir, brochuresUploadDir].forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch (err) {
        console.warn(`Upload destination creation warning (${dir}):`, err.message);
      }
    });

    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, brochuresUploadDir);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, imagesUploadDir);
    } else {
      cb(null, baseUploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF images and PDF files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
});
