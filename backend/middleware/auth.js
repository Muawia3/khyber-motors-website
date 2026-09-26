import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jac_motors_peshawar_super_secret_jwt_key_2026';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-admin-token']) {
      token = req.headers['x-admin-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Access token missing.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.warn('JWT verify error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token.',
    });
  }
};
