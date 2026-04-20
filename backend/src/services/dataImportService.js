const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { sequelize } = require('../config/database');
const { User, Hospital, Request, ImportLog } = require('../models');

class DataImportService {
  constructor() {
    this.validBloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    this.requiredFields = ['date', 'blood_type', 'demand'];
    this.importIdentity = {
      email: 'historical-import@bloodsuite.local',
      password: 'historical-import-disabled',
      role: 'admin',
      hospitalName: 'Historical Demand Import',
      licenseNumber: 'IMPORT-HISTORICAL-DATA',
      address: 'System-generated historical data import source',
    };
  }

  async processHistoricalData(filePath, userId, originalName = path.basename(filePath)) {
    const fileExt = path.extname(filePath).toLowerCase();
    const sourceType = fileExt.replace('.', '');
    let data = [];

    try {
      data = await this._loadFileData(filePath, fileExt);

      const validation = this._validateDataStructure(data);
      if (!validation.isValid) {
        await this._logImport({
          userId,
          fileName: originalName,
          sourceType,
          totalRecords: data.length,
          insertedRecords: 0,
          skippedRecords: data.length,
          status: 'failed',
          notes: validation.errors.join('; '),
        });
        throw new Error(`Invalid data structure: ${validation.errors.join(', ')}`);
      }

      const result = await this._insertHistoricalData(data, userId, {
        fileName: originalName,
        sourceType,
      });

      fs.unlinkSync(filePath);

      try {
        await this._triggerModelRetraining();
      } catch (trainingError) {
        result.retrainingWarning = trainingError.message;
      }

      return result;
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async validateDataFile(filePath) {
    const fileExt = path.extname(filePath).toLowerCase();

    try {
      const data = await this._loadFileData(filePath, fileExt);
      const validation = this._validateDataStructure(data);

      fs.unlinkSync(filePath);

      return {
        isValid: validation.isValid,
        errors: validation.errors,
        recordCount: data.length,
        preview: data.slice(0, 5),
      };
    } catch (error) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async getImportHistory() {
    const logs = await ImportLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['email'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return logs.map((log) => ({
      id: log.id,
      fileName: log.file_name,
      date: log.createdAt,
      records: log.total_records,
      insertedRecords: log.inserted_records,
      skippedRecords: log.skipped_records,
      status: log.status,
      uploadedBy: log.user?.email || 'Unknown',
      notes: log.notes,
    }));
  }

  generateTemplate() {
    return {
      description: 'Upload historical blood demand data in CSV or Excel format',
      requiredColumns: ['date', 'blood_type', 'demand'],
      optionalColumns: ['hospital_license_number', 'notes'],
      validBloodTypes: this.validBloodTypes,
      dateFormat: 'YYYY-MM-DD',
      demandFormat: 'Number of 450ml units demanded on that date',
      sampleData: [
        {
          date: '2026-01-01',
          blood_type: 'O+',
          demand: 25,
          hospital_license_number: 'LS-HOS-001',
          notes: 'Holiday surge',
        },
        {
          date: '2026-01-02',
          blood_type: 'A+',
          demand: 18,
          hospital_license_number: 'LS-HOS-001',
          notes: '',
        },
        {
          date: '2026-01-02',
          blood_type: 'O-',
          demand: 6,
          hospital_license_number: '',
          notes: 'National aggregate record',
        },
      ],
    };
  }

  async _loadFileData(filePath, fileExt) {
    if (fileExt === '.csv') {
      return this._parseCSV(filePath);
    }

    if (fileExt === '.xlsx' || fileExt === '.xls') {
      return this._parseExcel(filePath);
    }

    throw new Error('Unsupported file format');
  }

  _parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  _parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  }

  _validateDataStructure(data) {
    const errors = [];

    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, errors: ['File contains no data'] };
    }

    const sampleRows = data.slice(0, Math.min(50, data.length));

    sampleRows.forEach((row, index) => {
      this.requiredFields.forEach((field) => {
        if (!(field in row) || row[field] === null || row[field] === undefined || row[field] === '') {
          errors.push(`Row ${index + 1}: Missing required field '${field}'`);
        }
      });

      if (row.blood_type && !this.validBloodTypes.includes(String(row.blood_type).trim())) {
        errors.push(`Row ${index + 1}: Invalid blood type '${row.blood_type}'`);
      }

      if (row.date) {
        const parsedDate = new Date(row.date);
        if (Number.isNaN(parsedDate.getTime())) {
          errors.push(`Row ${index + 1}: Invalid date '${row.date}'`);
        }
      }

      if (row.demand !== undefined && row.demand !== null && row.demand !== '') {
        const demand = Number.parseFloat(row.demand);
        if (!Number.isFinite(demand) || demand < 0) {
          errors.push(`Row ${index + 1}: Invalid demand '${row.demand}'`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)],
    };
  }

  async _insertHistoricalData(data, userId, meta) {
    const transaction = await sequelize.transaction();
    let insertedRecords = 0;
    let skippedRecords = 0;

    try {
      const defaultHospital = await this._ensureImportHospital(transaction);

      for (const row of data) {
        try {
          const requestDate = this._normalizeDate(row.date);
          const bloodType = String(row.blood_type).trim();
          const quantityMl = this._normalizeDemandToMl(row.demand);
          const hospital = await this._resolveHospitalForRow(row, defaultHospital, transaction);

          await Request.create({
            hospital_id: hospital.id,
            blood_type: bloodType,
            quantity_ml: quantityMl,
            urgency: 'routine',
            status: 'fulfilled',
            patient_name: 'Historical demand import',
            patient_blood_type: bloodType,
            required_date: requestDate.toISOString().split('T')[0],
            notes: row.notes ? String(row.notes) : 'Imported from historical demand dataset',
            createdAt: requestDate,
            updatedAt: new Date(),
          }, { transaction });

          insertedRecords++;
        } catch (rowError) {
          skippedRecords++;
          console.warn(
            `Skipping imported row (${row.date}, ${row.blood_type}): ${rowError.message}`
          );
        }
      }

      await transaction.commit();

      const status = insertedRecords === 0
        ? 'failed'
        : skippedRecords > 0
          ? 'partial'
          : 'success';

      await this._logImport({
        userId,
        fileName: meta.fileName,
        sourceType: meta.sourceType,
        totalRecords: data.length,
        insertedRecords,
        skippedRecords,
        status,
        notes: skippedRecords > 0 ? `${skippedRecords} rows were skipped during import.` : null,
      });

      return {
        totalRecords: data.length,
        insertedRecords,
        skippedRecords,
      };
    } catch (error) {
      await transaction.rollback();

      await this._logImport({
        userId,
        fileName: meta.fileName,
        sourceType: meta.sourceType,
        totalRecords: data.length,
        insertedRecords: 0,
        skippedRecords: data.length,
        status: 'failed',
        notes: error.message,
      });

      throw error;
    }
  }

  async _ensureImportHospital(transaction) {
    let user = await User.findOne({
      where: { email: this.importIdentity.email },
      transaction,
    });

    if (!user) {
      user = await User.create({
        email: this.importIdentity.email,
        password_hash: this.importIdentity.password,
        role: this.importIdentity.role,
        is_active: true,
      }, { transaction });
    }

    let hospital = await Hospital.findOne({
      where: { license_number: this.importIdentity.licenseNumber },
      transaction,
    });

    if (!hospital) {
      hospital = await Hospital.create({
        user_id: user.id,
        hospital_name: this.importIdentity.hospitalName,
        license_number: this.importIdentity.licenseNumber,
        address: this.importIdentity.address,
        is_approved: true,
      }, { transaction });
    }

    return hospital;
  }

  async _resolveHospitalForRow(row, defaultHospital, transaction) {
    const licenseNumber = row.hospital_license_number ? String(row.hospital_license_number).trim() : '';
    const hospitalName = row.hospital_name ? String(row.hospital_name).trim() : '';

    if (licenseNumber) {
      const hospital = await Hospital.findOne({
        where: { license_number: licenseNumber },
        transaction,
      });

      if (!hospital) {
        throw new Error(`Unknown hospital license number '${licenseNumber}'`);
      }

      return hospital;
    }

    if (hospitalName) {
      const hospital = await Hospital.findOne({
        where: { hospital_name: hospitalName },
        transaction,
      });

      if (!hospital) {
        throw new Error(`Unknown hospital name '${hospitalName}'`);
      }

      return hospital;
    }

    return defaultHospital;
  }

  _normalizeDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date '${value}'`);
    }
    return date;
  }

  _normalizeDemandToMl(value) {
    const units = Number.parseFloat(value);
    if (!Number.isFinite(units) || units < 0) {
      throw new Error(`Invalid demand '${value}'`);
    }
    return Math.max(450, Math.round(units * 450));
  }

  async _logImport({
    userId,
    fileName,
    sourceType,
    totalRecords,
    insertedRecords,
    skippedRecords,
    status,
    notes,
  }) {
    await ImportLog.create({
      user_id: userId,
      file_name: fileName,
      source_type: sourceType || 'csv',
      total_records: totalRecords || 0,
      inserted_records: insertedRecords || 0,
      skipped_records: skippedRecords || 0,
      status,
      notes,
    });
  }

  async _triggerModelRetraining() {
    const forecastService = require('./forecastService');
    await forecastService.retrainModels();
  }
}

module.exports = new DataImportService();
