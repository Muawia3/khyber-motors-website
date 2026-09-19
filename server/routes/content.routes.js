import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/content/:key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const content = await prisma.pageContent.findUnique({
      where: { key: key.toLowerCase() },
    });

    if (!content) {
      return res.status(404).json({ success: false, error: `Content key '${key}' not found.` });
    }

    const data = typeof content.data === 'string' ? JSON.parse(content.data) : content.data;
    return res.json({ success: true, key: content.key, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/content/:key (Admin protected)
const updateContentHandler = async (req, res) => {
  try {
    const { key } = req.params;
    let dataToSave = req.body.data !== undefined ? req.body.data : req.body;

    if (!dataToSave) {
      return res.status(400).json({ success: false, error: 'Content data is required.' });
    }

    const stringifiedData = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave);

    const updated = await prisma.pageContent.upsert({
      where: { key: key.toLowerCase() },
      update: { data: stringifiedData },
      create: { key: key.toLowerCase(), data: stringifiedData },
    });

    const parsed = typeof updated.data === 'string' ? JSON.parse(updated.data) : updated.data;
    return res.json({ success: true, key: updated.key, data: parsed });
  } catch (error) {
    console.error('Update content error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

router.put('/:key', authMiddleware, updateContentHandler);
router.post('/:key', authMiddleware, updateContentHandler);

export default router;
