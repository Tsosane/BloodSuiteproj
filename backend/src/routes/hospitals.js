// src/routes/hospitals.js
const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalProfile,
  registerHospital,
  approveHospital,
  getPendingHospitals,
} = require('../controllers/hospitalController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]), getHospitals);
router.get('/me', rbacMiddleware([ROLES.HOSPITAL]), getHospitalProfile);
router.get('/pending', rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]), getPendingHospitals);
router.post('/register', rbacMiddleware([ROLES.HOSPITAL]), registerHospital);
router.put('/:id/approve', rbacMiddleware([ROLES.ADMIN]), approveHospital);

module.exports = router;