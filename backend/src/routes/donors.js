// src/routes/donors.js
const express = require('express');
const router = express.Router();
const {
  getDonors,
  getDonorProfile,
  updateDonorProfile,
  getNearbyDonors,
  recordDonation,
  getDonationHistory,
} = require('../controllers/donorController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);

router.get('/', rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]), getDonors);
router.get('/me', rbacMiddleware([ROLES.DONOR]), getDonorProfile);
router.put('/me', rbacMiddleware([ROLES.DONOR]), updateDonorProfile);
router.get('/nearby', rbacMiddleware([ROLES.HOSPITAL, ROLES.ADMIN]), getNearbyDonors);
router.post('/donate', rbacMiddleware([ROLES.DONOR]), recordDonation);
router.get('/history', rbacMiddleware([ROLES.DONOR]), getDonationHistory);

module.exports = router;