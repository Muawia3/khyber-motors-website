import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jac_motors_peshawar_super_secret_jwt_key_2026';

// Helper to log authentication attempts
async function logAuthAttempt({ adminId = null, email, status, req }) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await prisma.loginHistory.create({
      data: {
        adminId,
        email: email.toLowerCase().trim(),
        status,
        ipAddress: String(ipAddress),
        userAgent: String(userAgent),
      },
    });
  } catch (err) {
    console.warn('Failed to record login history:', err.message);
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const admin = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin) {
      await logAuthAttempt({ email: cleanEmail, status: 'FAILED', req });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    if (admin.isActive === false) {
      await logAuthAttempt({ adminId: admin.id, email: cleanEmail, status: 'FAILED', req });
      return res.status(403).json({
        success: false,
        error: 'Account has been deactivated by administrator.',
      });
    }

    const isMatch = await bcrypt.compare(String(password), admin.passwordHash);
    if (!isMatch) {
      await logAuthAttempt({ adminId: admin.id, email: cleanEmail, status: 'FAILED', req });
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    // Record successful login & update last login timestamp
    await logAuthAttempt({ adminId: admin.id, email: cleanEmail, status: 'SUCCESS', req });

    const now = new Date();
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: now },
    });

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        name: admin.name,
        isPrimary: admin.isPrimary,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isPrimary: admin.isPrimary,
          isActive: admin.isActive,
          lastLoginAt: now,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.',
    });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPrimary: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: 'User account not active or not found.' });
    }

    return res.json({ success: true, data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/users (Protected)
router.get('/users', authMiddleware, async (_req, res) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPrimary: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/users (Protected - Add new admin)
router.post('/users', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      return res.status(400).json({ success: false, error: 'An admin account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const newUser = await prisma.adminUser.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        role: role || 'ADMIN',
        isActive: true,
        isPrimary: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPrimary: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/users/:id (Protected - Update admin details & status)
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const targetUser = await prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    // Safety checks: primary admin cannot be deactivated
    if (targetUser.isPrimary && isActive === false) {
      return res.status(400).json({ success: false, error: 'The primary admin account cannot be deactivated.' });
    }

    // Safety check: logged in user cannot deactivate themselves
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate your own active account.' });
    }

    const cleanEmail = email ? String(email).toLowerCase().trim() : targetUser.email;
    if (cleanEmail !== targetUser.email) {
      const emailCheck = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });
      if (emailCheck) {
        return res.status(400).json({ success: false, error: 'Email address is already in use by another admin.' });
      }
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : targetUser.name,
        email: cleanEmail,
        role: role || targetUser.role,
        isActive: typeof isActive === 'boolean' ? isActive : targetUser.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPrimary: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/auth/users/:id/password (Protected - Change/reset admin password)
router.put('/users/:id/password', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const targetUser = await prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/auth/users/:id (Protected - Delete admin user)
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await prisma.adminUser.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    if (targetUser.isPrimary) {
      return res.status(400).json({ success: false, error: 'Cannot delete the primary super admin account.' });
    }

    if (req.user.id === id) {
      return res.status(400).json({ success: false, error: 'Cannot delete your own active admin session account.' });
    }

    await prisma.adminUser.delete({ where: { id } });
    return res.json({ success: true, message: 'Admin account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/login-history (Protected - Audit logs)
router.get('/login-history', authMiddleware, async (_req, res) => {
  try {
    const history = await prisma.loginHistory.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, role: true },
        },
      },
    });
    return res.json({ success: true, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
