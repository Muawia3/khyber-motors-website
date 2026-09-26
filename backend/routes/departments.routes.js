import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_DEPARTMENTS = [
  {
    name: 'Showroom & Sales',
    contactPerson: 'Ahmad',
    phone: '+92 (091) 5840901',
    whatsapp: '+923001234567',
    email: 'sales@khybermotors.com.pk',
    displayOrder: 0,
    isActive: true,
  },
  {
    name: 'Authorized 3S Workshop',
    contactPerson: 'Ali',
    phone: '+92 (091) 5840902',
    whatsapp: '+923007654321',
    email: 'service@khybermotors.com.pk',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Genuine Spare Parts',
    contactPerson: 'Hamza',
    phone: '+92 (091) 5840903',
    whatsapp: '+923000000000',
    email: 'parts@khybermotors.com.pk',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Fleet & Corporate Sales',
    contactPerson: 'Corporate Desk',
    phone: '+92 (091) 5840904',
    whatsapp: '+923000000000',
    email: 'fleet@khybermotors.com.pk',
    displayOrder: 3,
    isActive: true,
  },
];

async function seedDefaultDepartmentsIfEmpty() {
  try {
    const count = await prisma.departmentContact.count();
    if (count === 0) {
      for (const d of DEFAULT_DEPARTMENTS) {
        await prisma.departmentContact.create({ data: d });
      }
    }
  } catch (err) {
    console.warn('DepartmentContact seed notice:', err.message);
  }
}

// GET /api/departments (Public & Admin)
router.get('/', async (req, res) => {
  try {
    await seedDefaultDepartmentsIfEmpty();

    const { activeOnly, active, all } = req.query;
    const filterActive = (activeOnly === 'true' || active === 'true') && all !== 'true';
    const whereClause = filterActive ? { isActive: true } : (all === 'true' ? {} : { isActive: true });

    const departments = await prisma.departmentContact.findMany({
      where: whereClause,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    console.error('GET departments error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/departments (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, contactPerson, phone, whatsapp, email, displayOrder, isActive } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxDept = await prisma.departmentContact.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      order = maxDept ? maxDept.displayOrder + 1 : 0;
    }

    const newDept = await prisma.departmentContact.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson ? contactPerson.trim() : null,
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : null,
        email: email ? email.trim() : null,
        displayOrder: order,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return res.status(201).json({ success: true, data: newDept });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/departments/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, phone, whatsapp, email, displayOrder, isActive } = req.body;

    const existing = await prisma.departmentContact.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Department contact not found.' });
    }

    const updated = await prisma.departmentContact.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        contactPerson: contactPerson !== undefined ? (contactPerson ? contactPerson.trim() : null) : existing.contactPerson,
        phone: phone !== undefined ? phone.trim() : existing.phone,
        whatsapp: whatsapp !== undefined ? (whatsapp ? whatsapp.trim() : null) : existing.whatsapp,
        email: email !== undefined ? (email ? email.trim() : null) : existing.email,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : existing.displayOrder,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/departments/public (Alias for active departments)
router.get('/public', async (req, res) => {
  try {
    await seedDefaultDepartmentsIfEmpty();
    const departments = await prisma.departmentContact.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    console.error('GET public departments error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/departments/:id/toggle (Admin protected)
router.put('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.departmentContact.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Department contact not found.' });
    }

    const updated = await prisma.departmentContact.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle department error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/departments/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.departmentContact.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Department contact not found.' });
    }

    await prisma.departmentContact.delete({ where: { id } });

    return res.json({ success: true, message: 'Department contact deleted successfully.' });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
