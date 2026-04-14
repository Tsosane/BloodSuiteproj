const { Request, BloodInventory, Hospital } = require('../models');
const { Op } = require('sequelize');

/**
 * Request Service - Implements FEFO allocation and urgency handling
 */

// FEFO allocation for blood requests
const allocateBloodForRequest = async (requestId) => {
  try {
    const request = await Request.findByPk(requestId, {
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'hospital_name', 'address', 'latitude', 'longitude']
        }
      ]
    });

    if (!request) {
      return {
        success: false,
        message: 'Request not found'
      };
    }

    // Get available blood units using FEFO (earliest expiring first)
    const availableUnits = await BloodInventory.findAll({
      where: {
        blood_type: request.blood_type,
        status: 'available',
        testing_status: 'passed',
        expiry_date: {
          [Op.gte]: new Date() // Non-expired blood only
        }
      },
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'hospital_name']
        },
        {
          model: Request,
          as: 'request',
          attributes: ['id'],
          required: false
        }
      ],
      order: [
        ['expiry_date', 'ASC'], // FEFO: First-Expiry-First-Out
        ['created_at', 'ASC'] // Secondary sort by creation date
      ]
    });

    // Calculate total available quantity
    const totalAvailable = availableUnits.reduce((sum, unit) => sum + unit.quantity_ml, 0);

    if (totalAvailable < request.quantity_ml) {
      return {
        success: false,
        message: `Insufficient blood. Available: ${totalAvailable}ml, Required: ${request.quantity_ml}ml`,
        availableUnits: availableUnits.map(unit => ({
          id: unit.id,
          quantity_ml: unit.quantity_ml,
          expiry_date: unit.expiry_date,
          hospital_name: unit.hospital?.hospital_name || 'Unknown'
        }))
      };
    }

    // Allocate blood units using FEFO
    let remainingQuantity = request.quantity_ml;
    const allocatedUnits = [];
    const updatedUnitIds = [];

    for (const unit of availableUnits) {
      if (remainingQuantity <= 0) break;

      const quantityToAllocate = Math.min(unit.quantity_ml, remainingQuantity);
      
      // Update unit
      await unit.update({
        status: 'reserved',
        quantity_ml: unit.quantity_ml - quantityToAllocate
      });

      // Create allocation record
      allocatedUnits.push({
        inventory_id: unit.id,
        allocated_quantity: quantityToAllocate,
        original_quantity: unit.quantity_ml,
        expiry_date: unit.expiry_date,
        hospital_id: unit.hospital_id,
        hospital_name: unit.hospital?.hospital_name || 'Unknown'
      });

      remainingQuantity -= quantityToAllocate;
      updatedUnitIds.push(unit.id);

      // If unit is fully allocated, mark as used
      if (unit.quantity_ml - quantityToAllocate === 0) {
        await unit.update({ status: 'used' });
      }
    }

    // Update request with allocation details
    await request.update({
      status: 'fulfilled',
      fulfilled_from: allocatedUnits.map(unit => unit.inventory_id).join(','),
      fulfilled_at: new Date()
    });

    return {
      success: true,
      message: 'Blood allocated successfully using FEFO',
      data: {
        request: {
          id: request.id,
          blood_type: request.blood_type,
          quantity_ml: request.quantity_ml,
          urgency: request.urgency,
          status: 'fulfilled'
        },
        allocation: {
          allocatedUnits,
          totalAllocated: request.quantity_ml,
          unitsUsed: allocatedUnits.length
        }
      }
    };
  } catch (error) {
    console.error('Error in allocateBloodForRequest:', error);
    return {
      success: false,
      message: 'Failed to allocate blood for request'
    };
  }
};

// Emergency request processing with nearby donor matching
const processEmergencyRequest = async (requestId) => {
  try {
    const request = await Request.findByPk(requestId, {
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'hospital_name', 'address', 'latitude', 'longitude']
        }
      ]
    });

    if (!request) {
      return {
        success: false,
        message: 'Request not found'
      };
    }

    // Find nearby eligible donors using Haversine
    const nearbyDonorsQuery = `
      SELECT 
        d.id,
        d.full_name,
        d.blood_type,
        d.phone,
        d.latitude,
        d.longitude,
        (6371 * acos(cos(radians(${request.hospital.latitude})) * cos(radians(d.latitude)) * 
        cos(radians(d.longitude) - radians(${request.hospital.longitude})) + 
        sin(radians(${request.hospital.latitude})) * sin(radians(d.latitude)))) as distance_km
      FROM donors d
      WHERE d.is_eligible = true 
        AND d.blood_type = :blood_type
        AND d.latitude IS NOT NULL 
        AND d.longitude IS NOT NULL
        AND (6371 * acos(cos(radians(${request.hospital.latitude})) * cos(radians(d.latitude)) * 
        cos(radians(d.longitude) - radians(${request.hospital.longitude})) + 
        sin(radians(${request.hospital.latitude})) * sin(radians(d.latitude)))) <= 50
      ORDER BY distance_km
      LIMIT 20
    `;

    const [nearbyDonors] = await require('../config/database').sequelize.query(nearbyDonorsQuery, {
      replacements: { 
        blood_type: request.blood_type,
        hospital_latitude: request.hospital.latitude,
        hospital_longitude: request.hospital.longitude
      }
    });

    // Update request with nearby donors
    await request.update({
      status: 'processing',
      nearby_donors: nearbyDonors.map(donor => donor.id)
    });

    return {
      success: true,
      message: 'Emergency request processed successfully',
      data: {
        request: {
          id: request.id,
          blood_type: request.blood_type,
          quantity_ml: request.quantity_ml,
          urgency: request.urgency,
          status: 'processing'
        },
        nearbyDonors: nearbyDonors,
        totalFound: nearbyDonors.length
      }
    };
  } catch (error) {
    console.error('Error in processEmergencyRequest:', error);
    return {
      success: false,
      message: 'Failed to process emergency request'
    };
  }
};

// Get urgent requests (admin, hospital, manager)
const getUrgentRequests = async (filters = {}) => {
  try {
    const whereClause = {
      urgency: ['urgent', 'emergency']
    };

    if (filters.hospital_id) {
      whereClause.hospital_id = filters.hospital_id;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.blood_type) {
      whereClause.blood_type = filters.blood_type;
    }

    if (filters.created_after) {
      whereClause.created_at = {
        [Op.gte]: new Date(filters.created_after)
      };
    }

    const urgentRequests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: Hospital,
          as: 'hospital',
          attributes: ['id', 'hospital_name', 'address', 'phone']
        }
      ],
      order: [
        ['urgency', 'DESC'], // Emergency first, then Urgent
        ['created_at', 'DESC']
      ]
    });

    return {
      success: true,
      data: urgentRequests
    };
  } catch (error) {
    console.error('Error in getUrgentRequests:', error);
    return {
      success: false,
      message: 'Failed to get urgent requests'
    };
  }
};

// Update request status
const updateRequestStatus = async (requestId, status, notes = null) => {
  try {
    const request = await Request.findByPk(requestId);

    if (!request) {
      return {
        success: false,
        message: 'Request not found'
      };
    }

    const validStatuses = ['pending', 'processing', 'fulfilled', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: 'Invalid status. Must be one of: pending, processing, fulfilled, cancelled'
      };
    }

    const updateData = { status };
    if (notes) {
      updateData.notes = notes;
    }

    if (status === 'fulfilled') {
      updateData.fulfilled_at = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelled_at = new Date();
    }

    await request.update(updateData);

    return {
      success: true,
      message: `Request status updated to ${status}`,
      data: request
    };
  } catch (error) {
    console.error('Error in updateRequestStatus:', error);
    return {
      success: false,
      message: 'Failed to update request status'
    };
  }
};

// Get request statistics
const getRequestStats = async (filters = {}) => {
  try {
    const whereClause = {};

    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.urgency) {
      whereClause.urgency = filters.urgency;
    }

    if (filters.hospital_id) {
      whereClause.hospital_id = filters.hospital_id;
    }

    if (filters.blood_type) {
      whereClause.blood_type = filters.blood_type;
    }

    if (filters.created_after) {
      whereClause.created_at = {
        [Op.gte]: new Date(filters.created_after)
      };
    }

    const statsQuery = `
      SELECT 
        blood_type,
        urgency,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_requests,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_requests,
        AVG(CASE WHEN status = 'fulfilled' THEN 
          DATEDIFF(fulfilled_at, created_at) 
        ELSE NULL END) as avg_fulfillment_time_hours,
        SUM(CASE WHEN status = 'fulfilled' THEN quantity_ml ELSE 0 END) as total_fulfilled_quantity_ml,
        AVG(CASE WHEN status = 'fulfilled' THEN quantity_ml ELSE 0 END) as avg_fulfilled_quantity_ml
      FROM requests
      ${Object.keys(whereClause).length > 0 ? 'WHERE ' + Object.keys(whereClause).map(key => `${key} = :${key}`).join(' AND ') : ''}
      GROUP BY blood_type, urgency
      ORDER BY blood_type, urgency
    `;

    const [results] = await require('../config/database').sequelize.query(statsQuery, {
      replacements: whereClause
    });

    return {
      success: true,
      data: {
        stats: results,
        filters: filters
      }
    };
  } catch (error) {
    console.error('Error in getRequestStats:', error);
    return {
      success: false,
      message: 'Failed to get request statistics'
    };
  }
};

// Cancel request (admin, hospital)
const cancelRequest = async (requestId, cancellationReason) => {
  try {
    const request = await Request.findByPk(requestId);

    if (!request) {
      return {
        success: false,
        message: 'Request not found'
      };
    }

    // Check permissions
    if (request.status === 'fulfilled') {
      return {
        success: false,
        message: 'Cannot cancel a fulfilled request'
      };
    }

    await request.update({
      status: 'cancelled',
      cancellation_reason,
      cancelled_at: new Date()
    });

    // If blood was allocated, return it to inventory
    if (request.fulfilled_from) {
      const allocatedUnitIds = request.fulfilled_from.split(',').filter(id => id.trim());
      await BloodInventory.update(
        { status: 'available' },
        {
          where: {
            id: allocatedUnitIds
          }
        }
      );
    }

    return {
      success: true,
      message: 'Request cancelled successfully',
      data: request
    };
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    return {
      success: false,
      message: 'Failed to cancel request'
    };
  }
};

module.exports = {
  allocateBloodForRequest,
  processEmergencyRequest,
  getUrgentRequests,
  updateRequestStatus,
  getRequestStats,
  cancelRequest
};
