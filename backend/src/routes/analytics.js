// src/routes/analytics.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getInventorySummary,
  getRequestTrends,
  getDonorStats,
} = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]));

router.get('/dashboard', getDashboardStats);
router.get('/inventory-summary', getInventorySummary);
router.get('/request-trends', getRequestTrends);
router.get('/donor-stats', getDonorStats);

module.exports = router;