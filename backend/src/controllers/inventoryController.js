// src/controllers/inventoryController.js
const { BloodInventory, Hospital } = require('../models');
const { Op } = require('sequelize');

// Get all inventory for a hospital (FEFO ordered)
const getInventory = async (req, res) => {
  try {
    const { hospitalId, bloodType, status } = req.query;
    const where = {};

    if (hospitalId) where.hospital_id = hospitalId;
    if (bloodType) where.blood_type = bloodType;
    if (status) where.status = status;

    // If user is hospital staff, only show their inventory
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (hospital) where.hospital_id = hospital.id;
    }

    const inventory = await BloodInventory.findAll({
      where,
      order: [['expiry_date', 'ASC']], // FEFO ordering
    });

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add new blood unit
const addInventory = async (req, res) => {
  try {
    const { hospital_id, ...data } = req.body;

    // Verify hospital access
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (!hospital || hospital.id !== hospital_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only add inventory to your own hospital',
        });
      }
    }

    const inventory = await BloodInventory.create({
      hospital_id,
      ...data,
    });

    res.status(201).json({
      success: true,
      data: inventory,
      message: 'Blood unit added successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update inventory
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await BloodInventory.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Blood unit not found',
      });
    }

    // Check permission
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (!hospital || hospital.id !== inventory.hospital_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own hospital inventory',
        });
      }
    }

    await inventory.update(req.body);

    res.json({
      success: true,
      data: inventory,
      message: 'Blood unit updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete inventory
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await BloodInventory.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Blood unit not found',
      });
    }

    // Check permission
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (!hospital || hospital.id !== inventory.hospital_id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own hospital inventory',
        });
      }
    }

    await inventory.destroy();

    res.json({
      success: true,
      message: 'Blood unit deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get expiring units (within 7 days)
const getExpiringUnits = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const where = {
      expiry_date: {
        [Op.between]: [today, sevenDaysFromNow],
      },
      status: 'available',
    };

    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (hospital) where.hospital_id = hospital.id;
    }

    const inventory = await BloodInventory.findAll({
      where,
      order: [['expiry_date', 'ASC']],
    });

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get low stock units
const getLowStockUnits = async (req, res) => {
  try {
    const threshold = req.query.threshold || 5;
    const { BloodInventory, Hospital } = require('../models');
    const { Op } = require('sequelize');

    // Group by blood type and count available units
    const where = { status: 'available' };
    
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (hospital) where.hospital_id = hospital.id;
    }

    const lowStock = await BloodInventory.findAll({
      where,
      attributes: [
        'blood_type',
        [BloodInventory.sequelize.fn('COUNT', BloodInventory.sequelize.col('id')), 'count'],
      ],
      group: ['blood_type'],
      having: BloodInventory.sequelize.literal(`COUNT(id) < ${threshold}`),
    });

    res.json({
      success: true,
      data: lowStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getExpiringUnits,
  getLowStockUnits,
};