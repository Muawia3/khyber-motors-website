import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const ALLOWED_PLATFORMS = ['TikTok', 'Instagram', 'Facebook', 'WhatsApp'];

const DEFAULT_SOCIAL_LINKS = [
  {
    platform: 'TikTok',
    url: 'https://tiktok.com/@khybermotors',
    icon: 'TikTok',
    displayOrder: 0,
    isActive: true,
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/khybermotors',
    icon: 'Instagram',
    displayOrder: 1,
    isActive: true,
  },
  {
    platform: 'Facebook',
    url: 'https://facebook.com/khybermotors',
    icon: 'Facebook',
    displayOrder: 2,
    isActive: true,
  },
  {
    platform: 'WhatsApp',
    url: 'https://wa.me/923000000000',
    icon: 'WhatsApp',
    displayOrder: 3,
    isActive: true,
  },
];

// Helper to clean non-allowed platforms and seed initial social links
async function ensureAllowedSocialLinks() {
  try {
    // 1. Delete any legacy non-allowed platforms
    await prisma.socialLink.deleteMany({
      where: {
        platform: {
          notIn: ALLOWED_PLATFORMS,
        },
      },
    });

    // 2. Seed default social links if empty
    const count = await prisma.socialLink.count();
    if (count === 0) {
      for (const item of DEFAULT_SOCIAL_LINKS) {
        await prisma.socialLink.create({ data: item });
      }
      console.log('✅ Default social links (TikTok, Instagram, Facebook, WhatsApp) seeded in database.');
    }
  } catch (err) {
    console.warn('SocialLink sync notice:', err.message);
  }
}

// URL Validation Helper
function isValidUrl(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /api/social-links (Public & Admin)
router.get('/', async (req, res) => {
  try {
    await ensureAllowedSocialLinks();

    const { activeOnly, active } = req.query;
    const isOnlyActive = activeOnly === 'true' || active === 'true';
    const whereClause = isOnlyActive
      ? { isActive: true, platform: { in: ALLOWED_PLATFORMS } }
      : { platform: { in: ALLOWED_PLATFORMS } };

    const links = await prisma.socialLink.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({ success: true, count: links.length, data: links });
  } catch (error) {
    console.error('GET social links error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/social-links (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { platform, url, icon, displayOrder, isActive } = req.body;

    if (!platform || typeof platform !== 'string' || !platform.trim()) {
      return res.status(400).json({ success: false, error: 'Platform name is required.' });
    }

    const matchedPlatform = ALLOWED_PLATFORMS.find(
      (p) => p.toLowerCase() === platform.trim().toLowerCase()
    );

    if (!matchedPlatform) {
      return res.status(400).json({
        success: false,
        error: 'Only TikTok, Instagram, Facebook, and WhatsApp platforms are supported.',
      });
    }

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ success: false, error: 'A valid http:// or https:// URL is required.' });
    }

    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxItem = await prisma.socialLink.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      order = maxItem ? maxItem.displayOrder + 1 : 0;
    }

    const newLink = await prisma.socialLink.create({
      data: {
        platform: matchedPlatform,
        url: url.trim(),
        icon: matchedPlatform,
        displayOrder: order,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return res.status(201).json({ success: true, data: newLink });
  } catch (error) {
    console.error('Create social link error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/social-links/reorder (Admin protected)
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Reorder items array is required.' });
    }

    const updates = items.map((item, idx) =>
      prisma.socialLink.update({
        where: { id: item.id },
        data: { displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : idx },
      })
    );

    await Promise.all(updates);

    const reordered = await prisma.socialLink.findMany({
      where: { platform: { in: ALLOWED_PLATFORMS } },
      orderBy: { displayOrder: 'asc' },
    });

    return res.json({ success: true, message: 'Social links reordered successfully', data: reordered });
  } catch (error) {
    console.error('Reorder social links error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/social-links/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon, displayOrder, isActive } = req.body;

    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Social link record not found.' });
    }

    let matchedPlatform = existing.platform;
    if (platform !== undefined) {
      const match = ALLOWED_PLATFORMS.find(
        (p) => p.toLowerCase() === platform.trim().toLowerCase()
      );
      if (!match) {
        return res.status(400).json({
          success: false,
          error: 'Only TikTok, Instagram, Facebook, and WhatsApp platforms are supported.',
        });
      }
      matchedPlatform = match;
    }

    if (url !== undefined && !isValidUrl(url)) {
      return res.status(400).json({ success: false, error: 'A valid http:// or https:// URL is required.' });
    }

    const updated = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: matchedPlatform,
        url: url !== undefined ? url.trim() : existing.url,
        icon: matchedPlatform,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : existing.displayOrder,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update social link error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/social-links/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Social link record not found.' });
    }

    await prisma.socialLink.delete({ where: { id } });

    return res.json({ success: true, message: 'Social link deleted successfully.' });
  } catch (error) {
    console.error('Delete social link error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
