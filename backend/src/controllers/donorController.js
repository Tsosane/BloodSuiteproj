// src/controllers/donorController.js
const { Donor, User, BloodInventory } = require('../models');
const { haversineDistance } = require('../utils/haversine');
const { calculateEligibility } = require('../utils/eligibility');
const { Op } = require('sequelize');

// Get all donors (admin/manager only)
const getDonors = async (req, res) => {
  try {
    const { bloodType, isEligible, search } = req.query;
    const where = {};

    if (bloodType) where.blood_type = bloodType;
    if (isEligible !== undefined) where.is_eligible = isEligible === 'true';
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

    res.json({ success: true, data: donors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get current donor profile
const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found' });
    }

    const eligibility = donor.calculateEligibility();
    
    res.json({
      success: true,
      data: {
        ...donor.toJSON(),
        eligibility,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update donor profile
const updateDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ where: { user_id: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found' });
    }

    await donor.update(req.body);
    
    res.json({
      success: true,
      data: donor,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get nearby donors using Haversine formula
const getNearbyDonors = async (req, res) => {
  try {
    const { hospitalId, radiusKm = 10, bloodType, latitude, longitude } = req.query;

    // Get hospital coordinates
    const { Hospital } = require('../models');
    const hospital = await Hospital.findByPk(hospitalId);

    const originLatitude = latitude != null ? parseFloat(latitude) : parseFloat(hospital?.latitude);
    const originLongitude = longitude != null ? parseFloat(longitude) : parseFloat(hospital?.longitude);

    if (!hospital || Number.isNaN(originLatitude) || Number.isNaN(originLongitude)) {
      return res.status(400).json({ success: false, error: 'Hospital location not available' });
    }

    // Get eligible donors
    const donors = await Donor.findAll({
      where: {
        is_eligible: true,
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        ...(bloodType && { blood_type: bloodType }),
      },
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }],
    });

    // Calculate distances
    const nearbyDonors = donors
      .map(donor => ({
        ...donor.toJSON(),
        distance: haversineDistance(
          originLatitude,
          originLongitude,
          parseFloat(donor.latitude),
          parseFloat(donor.longitude)
        ),
      }))
      .filter(donor => donor.distance <= parseFloat(radiusKm))
      .sort((a, b) => a.distance - b.distance);

    res.json({ success: true, data: nearbyDonors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Record a donation
const recordDonation = async (req, res) => {
  try {
    const { hospitalId, quantityMl = 450, notes } = req.body;

    const donor = await Donor.findOne({ where: { user_id: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }

    // Check eligibility
    const eligibility = donor.calculateEligibility();
    if (!eligibility.isEligible) {
      return res.status(400).json({
        success: false,
        error: `Not eligible to donate. Next eligible date: ${eligibility.nextEligibleDate}`,
      });
    }

    // Update donor record
    const today = new Date().toISOString().split('T')[0];
    await donor.update({
      last_donation_date: today,
      donation_count: donor.donation_count + 1,
    });

    // Create blood inventory record
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
    });

    res.json({
      success: true,
      data: { donor, bloodInventory },
      message: 'Donation recorded successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get donation history
const getDonationHistory = async (req, res) => {
  try {
    const donor = await Donor.findOne({ where: { user_id: req.user.id } });
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }

    const donations = await BloodInventory.findAll({
      where: { donor_id: donor.id },
      include: [{ model: require('../models').Hospital, as: 'hospital', attributes: ['hospital_name'] }],
      order: [['collection_date', 'DESC']],
    });

    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDonors,
  getDonorProfile,
  updateDonorProfile,
  getNearbyDonors,
  recordDonation,
  getDonationHistory,
};
