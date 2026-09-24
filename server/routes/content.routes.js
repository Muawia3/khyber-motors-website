import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_DEFAULTS = {
  contact: {
    name: 'Khyber Motors',
    shortName: 'Khyber Motors',
    status: 'Authorized 3S Dealership (Sales, Service & Spare Parts)',
    tagline: 'Engineered for Performance. Built for Pakistan.',
    footerText: 'Khyber Pakhtunkhwa’s premier 3S Dealership for double cabin pickup trucks, commercial logistics vehicles, and modern crossover SUVs.',
    address: 'XHQQ+8GV, Ring Road Sohailabad, near Kakakhel CNG, Hazara Khawani, Peshawar, 25000, Pakistan',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan',
    mapEmbedUrl: 'https://maps.google.com/maps?q=XHQQ%2B8GV%2C+Ring+Road+Sohailabad%2C+near+Kakakhel+CNG%2C+Hazara+Khawani%2C+Peshawar%2C+25000%2C+Pakistan&t=&z=16&ie=UTF8&iwloc=&output=embed',
    plusCode: 'XHQQ+8GV, Peshawar',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    postalCode: '25000',
    phone: '+92 (091) 5840900',
    salesDirect: '+92 300 1234567',
    serviceDirect: '+92 300 7654321',
    whatsapp: '+92 300 0000000',
    email: 'muawiakhan000@gmail.com',
    social: {
      tiktok: 'https://tiktok.com/@khybermotors',
      instagram: 'https://instagram.com/khybermotors',
      facebook: 'https://facebook.com/khybermotors',
      whatsapp: 'https://wa.me/923000000000',
    },
    businessHours: [
      { days: 'Monday – Saturday', hours: '9:00 AM – 7:00 PM' },
      { days: 'Sunday', hours: 'Emergency Service Only (10:00 AM – 4:00 PM)' },
    ],
    departments: [
      { name: 'Showroom & Sales', contact: '+92 (091) 5840901', timing: '9:00 AM – 7:00 PM' },
      { name: 'Authorized 3S Workshop', contact: '+92 (091) 5840902', timing: '8:30 AM – 5:30 PM' },
      { name: 'Genuine Spare Parts', contact: '+92 (091) 5840903', timing: '9:00 AM – 6:00 PM' },
      { name: 'Fleet & Corporate Sales', contact: '+92 (091) 5840904', timing: '9:00 AM – 6:00 PM' },
    ],
  },
};

// GET /api/content/:key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const lowerKey = key.toLowerCase();
    let content = await prisma.pageContent.findUnique({
      where: { key: lowerKey },
    });

    if (!content && DEFAULT_DEFAULTS[lowerKey]) {
      const stringified = JSON.stringify(DEFAULT_DEFAULTS[lowerKey]);
      content = await prisma.pageContent.create({
        data: { key: lowerKey, data: stringified },
      });
    }

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
