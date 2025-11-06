import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Add decoded user info to the request
    next();
  });
};

// Role-based authorization middleware (extend later)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Example placeholder logic:
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Uncomment when you store roles in the user object:
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Forbidden: insufficient role' });
    // }

    next();
  };
};


export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies first (httpOnly cookie approach)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header for backwards compatibility
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};