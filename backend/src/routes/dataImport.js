// backend/src/routes/dataImport.js
const express = require('express');
const router = express.Router();
const dataImportController = require('../controllers/dataImportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All data import routes require admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Upload historical data
router.post('/upload',
  dataImportController.uploadMiddleware,
  dataImportController.uploadHistoricalData
);

// Validate data file without importing
router.post('/validate',
  dataImportController.uploadMiddleware,
  dataImportController.validateDataFile
);

// Get import history
router.get('/history', dataImportController.getImportHistory);

// Get data import template
router.get('/template', dataImportController.getDataImportTemplate);

module.exports = router;