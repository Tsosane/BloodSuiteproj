// backend/src/controllers/dataImportController.js
const dataImportService = require('../services/dataImportService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'), false);
    }
  }
});

const uploadMiddleware = upload.single('dataFile');

const uploadHistoricalData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = await dataImportService.processHistoricalData(
      req.file.path,
      req.user.id,
      req.file.originalname
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully imported ${result.totalRecords} records`
    });
  } catch (error) {
    console.error('Data import error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getImportHistory = async (req, res) => {
  try {
    const history = await dataImportService.getImportHistory();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const validateDataFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const validation = await dataImportService.validateDataFile(req.file.path);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getDataImportTemplate = async (req, res) => {
  try {
    const template = dataImportService.generateTemplate();

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  uploadHistoricalData,
  getImportHistory,
  validateDataFile,
  getDataImportTemplate,
  uploadMiddleware: upload.single('dataFile')
};
