// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'hospital', 'donor', 'blood_bank_manager']),
  validate,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

// Inventory validations
const validateInventory = [
  body('blood_type').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('quantity_ml').isInt({ min: 450, max: 2700 }),
  body('collection_date').isDate(),
  body('expiry_date').isDate(),
  validate,
];

// Request validations
const validateRequest = [
  body('blood_type').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('quantity_ml').isInt({ min: 450 }),
  body('urgency').isIn(['routine', 'urgent', 'emergency']),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateInventory,
  validateRequest,
};