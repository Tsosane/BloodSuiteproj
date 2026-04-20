const { Hospital, User, Request } = require('../models');
const { Op } = require('sequelize');

const getEffectiveApprovalStatus = (hospital) => {
  if (hospital.approval_status === 'rejected') {
    return 'rejected';
  }

  if (hospital.is_approved) {
    return 'approved';
  }

  return 'pending';
};

const serializeHospital = (hospital) => {
  const json = hospital.toJSON();
  return {
    ...json,
    approval_status: getEffectiveApprovalStatus(json),
  };
};

const buildHospitalFilters = (status, search) => {
  const andClauses = [];

  if (status === 'approved') {
    andClauses.push({ is_approved: true });
  } else if (status === 'pending') {
    andClauses.push({ is_approved: false });
    andClauses.push({
      [Op.or]: [
        { approval_status: 'pending' },
        { approval_status: null },
      ],
    });
  } else if (status === 'rejected') {
    andClauses.push({ approval_status: 'rejected' });
  }

  if (search) {
    andClauses.push({
      [Op.or]: [
        { hospital_name: { [Op.iLike]: `%${search}%` } },
        { license_number: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ],
    });
  }

  if (andClauses.length === 0) {
    return {};
  }

  if (andClauses.length === 1) {
    return andClauses[0];
  }

  return { [Op.and]: andClauses };
};

// Get all hospitals (admin/manager only)
const getHospitals = async (req, res) => {
  try {
    const { status, search } = req.query;

    const hospitals = await Hospital.findAll({
      where: buildHospitalFilters(status, search),
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: hospitals.map(serializeHospital) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get public list of approved hospitals for authenticated users
const getApprovedHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { is_approved: true },
      attributes: ['id', 'hospital_name', 'license_number', 'address', 'phone', 'latitude', 'longitude', 'capacity'],
      order: [['hospital_name', 'ASC']],
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

    res.json({ success: true, data: serializeHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Register new hospital (requires admin approval)
const registerHospital = async (req, res) => {
  try {
    const { hospital_name, license_number, address, phone, latitude, longitude, capacity } = req.body;

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
      approval_status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: serializeHospital(hospital),
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

    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    await hospital.update({
      is_approved: true,
      approval_status: 'approved',
    });

    res.json({
      success: true,
      data: serializeHospital(hospital),
      message: 'Hospital approved successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reject hospital (admin only)
const rejectHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findByPk(id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    await hospital.update({
      is_approved: false,
      approval_status: 'rejected',
    });

    res.json({
      success: true,
      data: serializeHospital(hospital),
      message: 'Hospital rejected successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get pending hospitals (admin/manager only)
const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.findAll({
      where: {
        [Op.and]: [
          { is_approved: false },
          {
            [Op.or]: [
              { approval_status: 'pending' },
              { approval_status: null },
            ],
          },
        ],
      },
      include: [{ model: User, as: 'user', attributes: ['email', 'created_at', 'is_active'] }],
      order: [['created_at', 'ASC']],
    });

    res.json({ success: true, data: hospitals.map(serializeHospital) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getHospitals,
  getApprovedHospitals,
  getHospitalProfile,
  registerHospital,
  approveHospital,
  rejectHospital,
  getPendingHospitals,
};
