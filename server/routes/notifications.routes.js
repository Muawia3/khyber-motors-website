import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper utility function to create a notification in database
 */
export async function createNotificationRecord({ type, title, message, relatedId }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: type || 'LEAD',
        title: title || 'New Notification',
        message: message || '',
        relatedId: relatedId || null,
        isRead: false,
      },
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification record:', err.message);
    return null;
  }
}

// GET /api/notifications (Admin protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const notifications = await prisma.notification.findMany({
      take: parseInt(limit, 10) || 30,
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });

    return res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('GET notifications error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/notifications/unread-count (Admin protected)
router.get('/unread-count', authMiddleware, async (_req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false },
    });
    return res.json({ success: true, count });
  } catch (error) {
    console.error('GET unread count error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/notifications/read-all (Admin protected)
router.put('/read-all', authMiddleware, async (_req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/notifications/:id/read (Admin protected)
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });

    return res.json({ success: true, unreadCount, data: updated });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/notifications/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    await prisma.notification.delete({ where: { id } });

    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });

    return res.json({ success: true, unreadCount, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
