import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createNotificationRecord } from './notifications.routes.js';
import { sendLeadEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /api/leads (Public submission)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, vehicleInterest, department, city, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone number are required.',
      });
    }

    const lead = await prisma.lead.create({
      data: {
        type: department?.toLowerCase().includes('service') ? 'SERVICE' : 'INQUIRY',
        name,
        phone,
        city: city || null,
        email: email || 'no-email@example.com',
        message: message || null,
        notes: `Department: ${department || 'N/A'}\nVehicle Interest: ${vehicleInterest || 'N/A'}`,
        status: 'NEW',
      },
    });

    // Automatically trigger notification for Admin
    const isContactForm = department || city || message;
    const isServiceReq = department?.toLowerCase().includes('service');

    let notifType = 'LEAD';
    let notifTitle = `New Lead: ${name}`;
    let notifMsg = `${name} (${phone}) requested information on ${vehicleInterest || 'JAC Vehicles'}.`;

    if (isServiceReq) {
      notifType = 'SERVICE_REQUEST';
      notifTitle = `Service Request: ${name}`;
      notifMsg = `${name} (${phone}) submitted a service inquiry for ${department || 'Workshop'}.`;
    } else if (isContactForm) {
      notifType = 'CONTACT_FORM';
      notifTitle = `Contact Form: ${name}`;
      notifMsg = `${name} (${phone}) from ${city || 'Unknown Location'}: "${message ? message.substring(0, 30) + '...' : 'New contact form submission'}"`;
    }

    await createNotificationRecord({
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      relatedId: lead.id,
    });

    // Send email asynchronously (don't await it so we don't block the response)
    sendLeadEmail(lead).catch(err => console.error('Email send error:', err));

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. Our team will contact you shortly.',
      data: lead,
    });
  } catch (error) {
    console.error('Submit lead error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/leads (Admin protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/leads/:id/status (Admin protected)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/leads/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    return res.json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
