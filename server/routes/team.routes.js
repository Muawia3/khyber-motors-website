import express from 'express';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

async function seedDefaultTeamIfEmpty() {
  try {
    const count = await prisma.teamMember.count();
    if (count === 0) {
      // 1. General Manager (Top level)
      const gm = await prisma.teamMember.create({
        data: {
          name: 'Tariq Khan',
          designation: 'General Manager',
          department: 'Executive Management',
          shortDescription: 'Overseeing overall dealership operations, growth strategy, and customer excellence.',
          imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
          displayOrder: 0,
          isActive: true,
        },
      });

      // 2. Sales Manager (Reports to GM)
      const salesManager = await prisma.teamMember.create({
        data: {
          name: 'Ahmad Raza',
          designation: 'Sales Manager',
          department: 'Sales & Commercial Fleet',
          shortDescription: 'Leading commercial truck sales, pickup vehicle consultations, and fleet deals.',
          imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
          parentId: gm.id,
          displayOrder: 1,
          isActive: true,
        },
      });

      // 3. Services Manager (Reports to GM)
      const serviceManager = await prisma.teamMember.create({
        data: {
          name: 'Muhammad Ali',
          designation: 'Services Manager',
          department: 'After-Sales Service',
          shortDescription: 'Managing state-of-the-art 3S service bay, technical teams, and spare parts.',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
          parentId: gm.id,
          displayOrder: 2,
          isActive: true,
        },
      });

      // 4. Sales Executive (Reports to Sales Manager)
      await prisma.teamMember.create({
        data: {
          name: 'Usman Shah',
          designation: 'Sales Executive',
          department: 'Sales & Commercial Fleet',
          shortDescription: 'Assisting individual and business clients in selecting the right JAC vehicles.',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
          parentId: salesManager.id,
          displayOrder: 3,
          isActive: true,
        },
      });

      // 5. Service Advisor (Reports to Service Manager)
      await prisma.teamMember.create({
        data: {
          name: 'Hamza Farooq',
          designation: 'Service Advisor',
          department: 'After-Sales Service',
          shortDescription: 'Guiding customers through maintenance scheduling, repair estimates, and parts.',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
          parentId: serviceManager.id,
          displayOrder: 4,
          isActive: true,
        },
      });
    }
  } catch (err) {
    console.warn('TeamMember seed notice:', err.message);
  }
}

// GET /api/team (Public & Admin)
router.get('/', async (req, res) => {
  try {
    await seedDefaultTeamIfEmpty();

    const { activeOnly, active, all } = req.query;
    const filterActive = (activeOnly === 'true' || active === 'true') && all !== 'true';
    const whereClause = filterActive ? { isActive: true } : (all === 'true' ? {} : { isActive: true });

    const team = await prisma.teamMember.findMany({
      where: whereClause,
      include: {
        parent: {
          select: { id: true, name: true, designation: true },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return res.json({ success: true, count: team.length, data: team });
  } catch (error) {
    console.error('GET team error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/team (Admin protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, designation, department, shortDescription, imageUrl, parentId, displayOrder, isActive } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    if (!designation || typeof designation !== 'string' || !designation.trim()) {
      return res.status(400).json({ success: false, error: 'Designation is required.' });
    }

    if (!department || typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({ success: false, error: 'Department is required.' });
    }

    let order = typeof displayOrder === 'number' ? displayOrder : 0;
    if (typeof displayOrder !== 'number') {
      const maxMember = await prisma.teamMember.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      order = maxMember ? maxMember.displayOrder + 1 : 0;
    }

    // Verify parent exists if provided
    let validParentId = null;
    if (parentId && parentId.trim()) {
      const parentExists = await prisma.teamMember.findUnique({ where: { id: parentId.trim() } });
      if (parentExists) {
        validParentId = parentExists.id;
      }
    }

    const newMember = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        designation: designation.trim(),
        department: department.trim(),
        shortDescription: shortDescription ? shortDescription.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        parentId: validParentId,
        displayOrder: order,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
      include: {
        parent: {
          select: { id: true, name: true, designation: true },
        },
      },
    });

    return res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    console.error('Create team member error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/team/:id (Admin protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department, shortDescription, imageUrl, parentId, displayOrder, isActive } = req.body;

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Team member profile not found.' });
    }

    // Prevent self-referencing hierarchy loops
    let targetParentId = existing.parentId;
    if (parentId !== undefined) {
      if (!parentId || !parentId.trim()) {
        targetParentId = null;
      } else if (parentId === id) {
        return res.status(400).json({ success: false, error: 'A team member cannot report to themselves.' });
      } else {
        // Check for descendant circular loop
        let currId = parentId.trim();
        let isCycle = false;
        const visited = new Set();
        while (currId) {
          if (currId === id) {
            isCycle = true;
            break;
          }
          if (visited.has(currId)) break;
          visited.add(currId);
          const pNode = await prisma.teamMember.findUnique({
            where: { id: currId },
            select: { parentId: true },
          });
          currId = pNode?.parentId || null;
        }

        if (isCycle) {
          return res.status(400).json({ success: false, error: 'Invalid parent: Cannot create a circular reporting loop.' });
        }

        const parentMember = await prisma.teamMember.findUnique({ where: { id: parentId.trim() } });
        if (parentMember) {
          targetParentId = parentMember.id;
        }
      }
    }


    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        designation: designation !== undefined ? designation.trim() : existing.designation,
        department: department !== undefined ? department.trim() : existing.department,
        shortDescription: shortDescription !== undefined ? (shortDescription ? shortDescription.trim() : null) : existing.shortDescription,
        imageUrl: imageUrl !== undefined ? (imageUrl ? imageUrl.trim() : null) : existing.imageUrl,
        parentId: targetParentId,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : existing.displayOrder,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
      },
      include: {
        parent: {
          select: { id: true, name: true, designation: true },
        },
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update team member error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/team/:id/toggle (Admin protected)
router.put('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Team member profile not found.' });
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle team member error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/team/:id (Admin protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Team member profile not found.' });
    }

    // Set children's parentId to null before deleting parent
    await prisma.teamMember.updateMany({
      where: { parentId: id },
      data: { parentId: existing.parentId || null },
    });

    await prisma.teamMember.delete({ where: { id } });

    return res.json({ success: true, message: 'Team member profile deleted successfully.' });
  } catch (error) {
    console.error('Delete team member error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
