import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all active gallery items (Public)
router.get('/', async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all gallery items (Admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create gallery item (Admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, shortDescription, imageUrl, isActive } = req.body;
    
    // Get max display order
    const maxOrder = await prisma.galleryItem.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    
    const newOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;

    const newItem = await prisma.galleryItem.create({
      data: {
        title,
        shortDescription: shortDescription || null,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: newOrder,
      },
    });

    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update gallery item (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, shortDescription, imageUrl, isActive } = req.body;

    const updatedItem = await prisma.galleryItem.update({
      where: { id },
      data: {
        title,
        shortDescription: shortDescription !== undefined ? shortDescription : null,
        imageUrl,
        isActive,
      },
    });

    return res.json({ success: true, data: updatedItem });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete gallery item (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.galleryItem.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Reorder gallery items (Admin)
router.put('/reorder/bulk', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Expected an array of items.' });
    }

    const updates = items.map((item) =>
      prisma.galleryItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    );

    await prisma.$transaction(updates);

    return res.json({ success: true, message: 'Order updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
