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
import analyticsRoutes from './routes/analytics.routes.js';
import galleryRoutes from './routes/gallery.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Edge Caching Middleware to prevent cold starts
const cacheMiddleware = (req, res, next) => {
  if (req.method === 'GET') {
    // Cache on Edge for 10 seconds, serve stale while revalidating for 24 hours
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=86400');
  }
  next();
};

// Dedicated file routes & static asset serving
app.use('/api/files', filesRoutes);
app.use('/uploads', handleUploadsStaticServing);
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/brochures', express.static(path.join(__dirname, '../frontend/public/brochures')));
app.use('/brochures', express.static(path.join(__dirname, '../public/brochures')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Khyber Motors REST API',
    timestamp: new Date().toISOString(),
    dbEngine: process.env.POSTGRES_PRISMA_URL ? 'postgres' : 'sqlite (or missing env)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Cached Public Routes
app.use('/api/vehicles', cacheMiddleware, vehicleRoutes);
app.use('/api/products', cacheMiddleware, vehicleRoutes);
app.use('/api/content', cacheMiddleware, contentRoutes);
app.use('/api/hero-images', cacheMiddleware, heroImagesRoutes);
app.use('/api/social-links', cacheMiddleware, socialLinksRoutes);
app.use('/api/reviews', cacheMiddleware, reviewsRoutes);
app.use('/api/departments', cacheMiddleware, departmentsRoutes);
app.use('/api/team', cacheMiddleware, teamRoutes);
app.use('/api/gallery', cacheMiddleware, galleryRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
