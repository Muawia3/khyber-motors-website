import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/hero-images (Public & Admin)
router.get('/', async (req, res) => {
  try {

    const { activeOnly, active } = req.query;
    const isOnlyActive = activeOnly === 'true' || active === 'true';
    const whereClause = isOnlyActive ? { isActive: true } : {};

    const images = await prisma.heroImage.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({ success: true, count: images.length, data: images });
  } catch (error) {
    console.error('GET hero images error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/hero-images (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, title, altText, displayOrder, isActive } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Valid image URL or path is required.' });
    }

    // Determine default display order if not provided
    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxImg = await prisma.heroImage.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      order = maxImg ? maxImg.displayOrder + 1 : 0;
    }

    const newHeroImage = await prisma.heroImage.create({
      data: {
        url: url.trim(),
        title: title ? title.trim() : 'JAC Hero Image',
        altText: altText ? altText.trim() : 'JAC Vehicle Hero Image',
        displayOrder: order,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return res.status(201).json({ success: true, data: newHeroImage });
  } catch (error) {
    console.error('Create hero image error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/hero-images/reorder (Admin protected)
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Reorder items array is required.' });
    }

    const updates = items.map((item, idx) =>
      prisma.heroImage.update({
        where: { id: item.id },
        data: { displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : idx },
      })
    );

    await Promise.all(updates);

    const reordered = await prisma.heroImage.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({ success: true, message: 'Hero images reordered successfully', data: reordered });
  } catch (error) {
    console.error('Reorder hero images error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/hero-images/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, altText, displayOrder, isActive } = req.body;

    const existing = await prisma.heroImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Hero image not found.' });
    }

    const updated = await prisma.heroImage.update({
      where: { id },
      data: {
        url: url !== undefined ? url.trim() : existing.url,
        title: title !== undefined ? title.trim() : existing.title,
        altText: altText !== undefined ? altText.trim() : existing.altText,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : existing.displayOrder,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update hero image error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/hero-images/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.heroImage.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Hero image not found.' });
    }

    await prisma.heroImage.delete({ where: { id } });

    return res.json({ success: true, message: 'Hero image deleted successfully.' });
  } catch (error) {
    console.error('Delete hero image error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
