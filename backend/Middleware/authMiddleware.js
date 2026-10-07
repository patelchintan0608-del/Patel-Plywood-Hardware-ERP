import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import Employee from '../Models/Employee.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'furniture_erp_secret_key_2026'
      );

      let user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        // Fallback to Employee collection if not found in User collection
        user = await Employee.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User account no longer exists' });
      }

      const statusVal = user.status ? user.status.toLowerCase() : 'active';
      if (statusVal === 'deactivated' || statusVal === 'inactive') {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth token error:', error.message);
      return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization denied. No token provided.' });
  }
};

export const authenticate = protect;

export const requireAdmin = (req, res, next) => {
  if (req.user && ['admin', 'superadmin'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
};
