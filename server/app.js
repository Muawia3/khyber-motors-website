import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import leadRoutes from './routes/leads.routes.js';
import contentRoutes from './routes/content.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import filesRoutes, { handleUploadsStaticServing } from './routes/files.routes.js';
import heroImagesRoutes from './routes/heroImages.routes.js';
import socialLinksRoutes from './routes/socialLinks.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import departmentsRoutes from './routes/departments.routes.js';
import teamRoutes from './routes/team.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dedicated file routes & static asset serving
app.use('/api/files', filesRoutes);
app.use('/uploads', handleUploadsStaticServing);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/brochures', express.static(path.join(__dirname, '../public/brochures')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Khyber Motors REST API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/hero-images', heroImagesRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/team', teamRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
