import jwt from 'jsonwebtoken';

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
