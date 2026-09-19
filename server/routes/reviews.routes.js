import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews (Public & Admin)
router.get('/', async (req, res) => {
  try {
    const { activeOnly, active, all } = req.query;
    const filterActive = (activeOnly === 'true' || active === 'true') && all !== 'true';
    const whereClause = filterActive ? { isActive: true } : (all === 'true' ? {} : { isActive: true });

    const reviews = await prisma.review.findMany({
      where: whereClause,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error('GET reviews error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/reviews (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerName, avatarUrl, rating, reviewText, reviewDate, displayOrder, isActive } = req.body;

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }

    if (!reviewText || typeof reviewText !== 'string' || !reviewText.trim()) {
      return res.status(400).json({ success: false, error: 'Review text is required.' });
    }

    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxRev = await prisma.review.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      order = maxRev ? maxRev.displayOrder + 1 : 0;
    }

    const numRating = typeof rating === 'number' ? Math.min(5, Math.max(1, rating)) : parseInt(rating, 10) || 5;

    const newReview = await prisma.review.create({
      data: {
        customerName: customerName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        rating: Math.min(5, Math.max(1, numRating)),
        reviewText: reviewText.trim(),
        reviewDate: reviewDate ? reviewDate.trim() : null,
        displayOrder: order,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/reviews/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, avatarUrl, rating, reviewText, reviewDate, displayOrder, isActive } = req.body;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    let numRating = existing.rating;
    if (rating !== undefined) {
      const parsed = typeof rating === 'number' ? rating : parseInt(rating, 10);
      if (!isNaN(parsed)) {
        numRating = Math.min(5, Math.max(1, parsed));
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        customerName: customerName !== undefined ? customerName.trim() : existing.customerName,
        avatarUrl: avatarUrl !== undefined ? (avatarUrl ? avatarUrl.trim() : null) : existing.avatarUrl,
        rating: numRating,
        reviewText: reviewText !== undefined ? reviewText.trim() : existing.reviewText,
        reviewDate: reviewDate !== undefined ? (reviewDate ? reviewDate.trim() : null) : existing.reviewDate,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : existing.displayOrder,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/reviews/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    await prisma.review.delete({ where: { id } });

    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
