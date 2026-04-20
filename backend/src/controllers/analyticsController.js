// src/controllers/analyticsController.js
const { BloodInventory, Request, Donor, Hospital } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Inventory summary
    const inventoryByType = await BloodInventory.findAll({
      where: { status: 'available' },
      attributes: [
        'blood_type',
        [BloodInventory.sequelize.fn('COUNT', BloodInventory.sequelize.col('id')), 'count'],
        [BloodInventory.sequelize.fn('SUM', BloodInventory.sequelize.col('quantity_ml')), 'total_ml'],
      ],
      group: ['blood_type'],
    });

    // Request trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const requestTrends = await Request.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: [
        [Request.sequelize.fn('DATE', Request.sequelize.col('created_at')), 'date'],
        [Request.sequelize.fn('COUNT', Request.sequelize.col('id')), 'count'],
        'urgency',
      ],
      group: ['date', 'urgency'],
    });

    // Donor statistics
    const totalDonors = await Donor.count();
    const eligibleDonors = await Donor.count({ where: { is_eligible: true } });
    const activeDonors = await Donor.count({
      where: {
        last_donation_date: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Hospital statistics
    const totalHospitals = await Hospital.count();
    const approvedHospitals = await Hospital.count({ where: { is_approved: true } });
    const pendingHospitals = await Hospital.count({
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
    });
    const rejectedHospitals = await Hospital.count({ where: { approval_status: 'rejected' } });

    // Request fulfillment rate
    const totalRequests = await Request.count();
    const fulfilledRequests = await Request.count({ where: { status: 'fulfilled' } });
    const fulfillmentRate = totalRequests > 0 ? (fulfilledRequests / totalRequests) * 100 : 0;

    res.json({
      success: true,
      data: {
        inventory: inventoryByType,
        requestTrends,
        donors: {
          total: totalDonors,
          eligible: eligibleDonors,
          active: activeDonors,
        },
        hospitals: {
          total: totalHospitals,
          approved: approvedHospitals,
          pending: pendingHospitals,
          rejected: rejectedHospitals,
        },
        requests: {
          total: totalRequests,
          fulfilled: fulfilledRequests,
          fulfillmentRate: Math.round(fulfillmentRate),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get inventory summary
const getInventorySummary = async (req, res) => {
  try {
    const summary = await BloodInventory.findAll({
      where: { status: 'available' },
      attributes: [
        'blood_type',
        [BloodInventory.sequelize.fn('COUNT', BloodInventory.sequelize.col('id')), 'available_units'],
        [BloodInventory.sequelize.fn('SUM', BloodInventory.sequelize.col('quantity_ml')), 'total_ml'],
      ],
      group: ['blood_type'],
      order: [['blood_type', 'ASC']],
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get request trends
const getRequestTrends = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    const days = period === '90days' ? 90 : period === '1year' ? 365 : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Request.findAll({
      where: {
        created_at: { [Op.gte]: startDate },
      },
      attributes: [
        [Request.sequelize.fn('DATE_TRUNC', 'day', Request.sequelize.col('created_at')), 'date'],
        [Request.sequelize.fn('COUNT', Request.sequelize.col('id')), 'total'],
        [Request.sequelize.fn('SUM', Request.sequelize.literal("CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END")), 'fulfilled'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
    });

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get donor statistics
const getDonorStats = async (req, res) => {
  try {
    const donorStats = await Donor.findAll({
      attributes: [
        'blood_type',
        [Donor.sequelize.fn('COUNT', Donor.sequelize.col('id')), 'count'],
        [Donor.sequelize.fn('AVG', Donor.sequelize.col('donation_count')), 'avg_donations'],
      ],
      group: ['blood_type'],
    });

    const donationFrequency = await Donor.findAll({
      attributes: [
        [Donor.sequelize.fn('DATE_TRUNC', 'month', Donor.sequelize.col('last_donation_date')), 'month'],
        [Donor.sequelize.fn('COUNT', Donor.sequelize.col('id')), 'donations'],
      ],
      where: {
        last_donation_date: { [Op.ne]: null },
      },
      group: ['month'],
      order: [['month', 'ASC']],
      limit: 12,
    });

    res.json({
      success: true,
      data: {
        byBloodType: donorStats,
        donationFrequency,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getInventorySummary,
  getRequestTrends,
  getDonorStats,
};
