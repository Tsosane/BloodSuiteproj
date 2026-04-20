const express = require('express');
const router = express.Router();
const {
  getForecast,
  getAllForecasts,
  getShortageAlerts,
  getRecommendedStock,
  getModelAccuracy,
  exportForecastReport,
  retrainModels,
  triggerDonorNotifications,
} = require('../controllers/forecastController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);

router.get(
  '/alerts',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  getShortageAlerts
);
router.get(
  '/recommendations',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  getRecommendedStock
);
router.get(
  '/accuracy',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  getModelAccuracy
);
router.post(
  '/export',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  exportForecastReport
);
router.post(
  '/train',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
  retrainModels
);
router.post(
  '/notify-donors',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  triggerDonorNotifications
);
router.get(
  '/:bloodType',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  getForecast
);
router.get(
  '/',
  rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.HOSPITAL]),
  getAllForecasts
);

module.exports = router;
