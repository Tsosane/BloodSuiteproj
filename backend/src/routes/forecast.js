const express = require('express');
const router = express.Router();
const {
  getForecast,
  getAllForecasts,
  getShortageAlerts,
  getModelAccuracy,
  retrainModels,
  healthCheck
} = require('../controllers/forecastController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware([ROLES.ADMIN, ROLES.MANAGER]));

router.get('/alerts', getShortageAlerts);
router.get('/recommendations', getRecommendedStock);
router.get('/accuracy', getModelAccuracy);
router.post('/train', retrainModels);
router.get('/:bloodType', getForecast);
router.get('/', getAllForecasts);

module.exports = router;
