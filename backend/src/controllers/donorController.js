// src/controllers/donorController.js
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Donor, User, BloodInventory, Hospital } = require('../models');
const { haversineDistance } = require('../utils/haversine');

const DONOR_FIELDS = [
  'full_name',
  'blood_type',
  'date_of_birth',
  'gender',
  'phone',
  'address',
  'latitude',
  'longitude',
  'medical_history',
];

const sanitizeText = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

const sanitizeCoordinate = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
};

const sanitizeDonorPayload = (payload = {}) => {
  const donorData = {};

  for (const field of DONOR_FIELDS) {
    if (!(field in payload)) {
      continue;
    }

    if (field === 'latitude' || field === 'longitude') {
      donorData[field] = sanitizeCoordinate(payload[field]);
      continue;
    }

    donorData[field] = sanitizeText(payload[field]);
  }

  return donorData;
};

const serializeDonor = (donor) => {
  if (!donor) {
    return null;
  }

  return {
    ...donor.toJSON(),
    eligibility: donor.calculateEligibility(),
  };
};

const getDonors = async (req, res) => {
  try {
    const { bloodType, isEligible, search } = req.query;
    const where = {};

    if (bloodType) {
      where.blood_type = bloodType;
    }

    if (isEligible !== undefined) {
      where.is_eligible = isEligible === 'true';
    }

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const donors = await Donor.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: donors.map((donor) => serializeDonor(donor)),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createDonor = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      email,
      password = 'donor123',
      ...rawDonorPayload
    } = req.body || {};

    const normalizedEmail = sanitizeText(email)?.toLowerCase();
    const donorPayload = sanitizeDonorPayload(rawDonorPayload);

    if (!normalizedEmail) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    if (!donorPayload.full_name || !donorPayload.blood_type) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'full_name and blood_type are required to register a donor.',
      });
    }

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'A user already exists with this email address.',
      });
    }

    const user = await User.create({
      email: normalizedEmail,
      password_hash: password,
      role: 'donor',
      is_active: true,
    }, { transaction });

    const donor = await Donor.create({
      user_id: user.id,
      ...donorPayload,
    }, { transaction });

    await transaction.commit();

    const createdDonor = await Donor.findByPk(donor.id, {
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    res.status(201).json({
      success: true,
      data: serializeDonor(createdDonor),
      temporaryPassword: req.body?.password ? undefined : password,
      message: 'Donor account created successfully.',
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found' });
    }

    res.json({
      success: true,
      data: serializeDonor(donor),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateDonorProfile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const donor = await Donor.findOne({
      where: { user_id: req.user.id },
      transaction,
    });

    if (!donor) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'Donor profile not found' });
    }

    const donorUpdates = sanitizeDonorPayload(req.body);
    const requestedEmail = sanitizeText(req.body?.email)?.toLowerCase();

    if (requestedEmail && requestedEmail !== req.user.email) {
      const existingUser = await User.findOne({
        where: {
          email: requestedEmail,
          id: { [Op.ne]: req.user.id },
        },
        transaction,
      });

      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Another user already uses this email address.',
        });
      }

      await req.user.update({ email: requestedEmail }, { transaction });
    }

    await donor.update(donorUpdates, { transaction });
    await transaction.commit();

    const refreshedDonor = await Donor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    res.json({
      success: true,
      data: serializeDonor(refreshedDonor),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

const getNearbyDonors = async (req, res) => {
  try {
    const { hospitalId, radiusKm = 10, bloodType, latitude, longitude } = req.query;
    const hospital = await Hospital.findByPk(hospitalId);

    const originLatitude = latitude != null ? Number.parseFloat(latitude) : Number.parseFloat(hospital?.latitude);
    const originLongitude = longitude != null ? Number.parseFloat(longitude) : Number.parseFloat(hospital?.longitude);

    if (!hospital || Number.isNaN(originLatitude) || Number.isNaN(originLongitude)) {
      return res.status(400).json({ success: false, error: 'Hospital location not available' });
    }

    const donors = await Donor.findAll({
      where: {
        is_eligible: true,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        ...(bloodType ? { blood_type: bloodType } : {}),
      },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    const nearbyDonors = donors
      .filter((donor) => donor.user?.is_active !== false)
      .map((donor) => ({
        ...serializeDonor(donor),
        distance: haversineDistance(
          originLatitude,
          originLongitude,
          Number.parseFloat(donor.latitude),
          Number.parseFloat(donor.longitude),
        ),
      }))
      .filter((donor) => donor.distance <= Number.parseFloat(radiusKm))
      .sort((a, b) => a.distance - b.distance);

    res.json({ success: true, data: nearbyDonors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const recordDonation = async (req, res) => {
  try {
    const { hospitalId, quantityMl = 450, notes } = req.body;

    const donor = await Donor.findOne({ where: { user_id: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }

    const eligibility = donor.calculateEligibility();
    if (!eligibility.is_eligible) {
      return res.status(400).json({
        success: false,
        error: `Not eligible to donate. Next eligible date: ${eligibility.next_eligible_date}`,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    await donor.update({
      last_donation_date: today,
      donation_count: donor.donation_count + 1,
    });

    const bloodInventory = await BloodInventory.create({
      hospital_id: hospitalId,
      donor_id: donor.id,
      blood_type: donor.blood_type,
      quantity_ml: quantityMl,
      collection_date: today,
      expiry_date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 42);
        return date.toISOString().split('T')[0];
      })(),
      status: 'available',
      testing_status: 'pending',
      notes,
    });

    res.json({
      success: true,
      data: { donor: serializeDonor(donor), bloodInventory },
      message: 'Donation recorded successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDonationHistory = async (req, res) => {
  try {
    const donor = await Donor.findOne({ where: { user_id: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }

    const donations = await BloodInventory.findAll({
      where: { donor_id: donor.id },
      include: [{ model: Hospital, as: 'hospital', attributes: ['hospital_name'] }],
      order: [['collection_date', 'DESC']],
    });

    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDonor,
  getDonors,
  getDonorProfile,
  updateDonorProfile,
  getNearbyDonors,
  recordDonation,
  getDonationHistory,
};
