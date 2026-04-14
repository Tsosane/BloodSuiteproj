// src/controllers/requestController.js
const { Request, Hospital, BloodInventory, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all requests (with filters)
const getRequests = async (req, res) => {
  try {
    const { status, urgency, hospitalId, fromDate, toDate } = req.query;
    const where = {};

    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (hospitalId) where.hospital_id = hospitalId;
    if (fromDate && toDate) {
      where.created_at = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    // If user is hospital staff, only show their requests
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (hospital) where.hospital_id = hospital.id;
    }

    const requests = await Request.findAll({
      where,
      include: [{ model: Hospital, as: 'hospital', attributes: ['hospital_name'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new blood request
const createRequest = async (req, res) => {
  try {
    const { hospital_id, blood_type, quantity_ml, urgency, patient_name, patient_age, patient_blood_type, required_date, notes } = req.body;

    // Verify hospital access
    let finalHospitalId = hospital_id;
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { user_id: req.user.id } });
      if (!hospital) {
        return res.status(403).json({ success: false, error: 'Hospital not found' });
      }
      finalHospitalId = hospital.id;
    }

    const request = await Request.create({
      hospital_id: finalHospitalId,
      blood_type,
      quantity_ml,
      urgency,
      patient_name,
      patient_age,
      patient_blood_type,
      required_date,
      notes,
      status: 'pending',
    });

    // Create notification for admin and managers
    if (urgency === 'urgent' || urgency === 'emergency') {
      await Notification.create({
        user_id: null, // Will be sent to all admins and managers
        type: 'urgent_request',
        priority: urgency === 'emergency' ? 'critical' : 'high',
        title: `${urgency.toUpperCase()} Blood Request`,
        message: `Hospital ${hospital_id} needs ${quantity_ml}ml of ${blood_type} blood urgently`,
        action_required: true,
        action_url: `/requests/${request.id}`,
      });
    }

    res.status(201).json({
      success: true,
      data: request,
      message: 'Blood request submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    await request.update({ status });

    res.json({
      success: true,
      data: request,
      message: `Request status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fulfill request using FEFO (First-Expiry-First-Out)
const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Request cannot be fulfilled' });
    }

    // Find available units using FEFO (earliest expiry first)
    const unitsNeeded = Math.ceil(request.quantity_ml / 450);
    const availableUnits = await BloodInventory.findAll({
      where: {
        hospital_id: request.hospital_id,
        blood_type: request.blood_type,
        status: 'available',
        expiry_date: { [Op.gt]: new Date() },
      },
      order: [['expiry_date', 'ASC']], // FEFO
      limit: unitsNeeded,
    });

    if (availableUnits.length < unitsNeeded) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Need ${unitsNeeded} units, only ${availableUnits.length} available`,
      });
    }

    // Reserve the units
    for (const unit of availableUnits) {
      await unit.update({ status: 'reserved' });
    }

    await request.update({
      status: 'processing',
      fulfilled_from: availableUnits[0]?.id,
    });

    res.json({
      success: true,
      data: { request, allocatedUnits: availableUnits },
      message: `Request allocated ${availableUnits.length} units using FEFO`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel request
const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({ success: false, error: 'Cannot cancel fulfilled request' });
    }

    await request.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRequests,
  createRequest,
  updateRequestStatus,
  fulfillRequest,
  cancelRequest,
};