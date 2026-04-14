// src/middleware/rbac.js
const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Please login.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to access this resource.',
      });
    }

    next();
  };
};

// Role constants for easy reference
const ROLES = {
  ADMIN: 'admin',
  HOSPITAL: 'hospital',
  DONOR: 'donor',
  MANAGER: 'blood_bank_manager',
};

module.exports = { rbacMiddleware, ROLES };