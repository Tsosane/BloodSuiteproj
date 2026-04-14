// src/controllers/hospitalController.js
const { Hospital, User } = require('../models');
const { Op } = require('sequelize');

// Get all hospitals (admin/manager only)
const getHospitals = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) where.is_approved = status === 'approved';
    if (search) {
      where[Op.or] = [
        { hospital_name: { [Op.iLike]: `%${search}%` } },
              
        { license_number: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const hospitals = await Hospital.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get current hospital profile
const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital profile not found' });
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Register new hospital (requires admin approval)
const registerHospital = async (req, res) => {
  try {
    const { hospital_name, license_number, address, phone, latitude, longitude, capacity } = req.body;

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ where: { license_number } });
    if (existingHospital) {
      return res.status(400).json({ success: false, error: 'Hospital with this license already exists' });
    }

    const hospital = await Hospital.create({
      user_id: req.user.id,
      hospital_name,
      license_number,
      address,
      phone,
      latitude,
      longitude,
      capacity,
      is_approved: false,
    });

    res.status(201).json({
      success: true,
      data: hospital,
      message: 'Hospital registered successfully. Awaiting admin approval.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Approve hospital (admin only)
const approveHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    await hospital.update({ is_approved: approved === true });

    res.json({
      success: true,
      data: hospital,
      message: `Hospital ${approved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get pending hospitals (admin/manager only)
const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { is_approved: false },
      include: [{ model: User, as: 'user', attributes: ['email', 'created_at'] }],
      order: [['created_at', 'ASC']],
    });

    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getHospitals,
  getHospitalProfile,
  registerHospital,
  approveHospital,
  getPendingHospitals,
};