const { Donor, User, Notification } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./emailService');
const messageService = require('./messageService');

class DonorNotificationService {
  normalizeBloodType(value) {
    return typeof value === 'string' ? value.trim().toUpperCase() : '';
  }

  normalizeAlert(alert) {
    const bloodType = this.normalizeBloodType(alert.bloodType || alert.blood_type);
    const shortage = Math.max(
      0,
      Number(alert.shortage || 0)
    );

    return {
      bloodType,
      shortage,
      severity: alert.severity || (shortage >= 10 ? 'high' : 'medium'),
      hospitalName: alert.hospitalName || alert.hospital_name || null,
      location: alert.location || null,
      predictedDemand: Number(alert.predictedDemand || alert.predicted_demand_7d || 0),
      currentStock: Number(alert.currentStock || alert.current_stock || 0),
    };
  }

  async findEligibleDonors(bloodType, limit = 10, location = null) {
    try {
      const normalizedBloodType = this.normalizeBloodType(bloodType);

      const whereClause = {
        blood_type: normalizedBloodType,
        is_eligible: true,
      };

      if (location && location.latitude && location.longitude) {
        whereClause.latitude = { [Op.ne]: null };
        whereClause.longitude = { [Op.ne]: null };
      }

      return Donor.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          where: { is_active: true },
          attributes: ['id', 'email', 'is_active'],
        }],
        limit,
        order: [
          ['last_donation_date', 'ASC'],
          ['created_at', 'ASC'],
        ],
      });
    } catch (error) {
      console.error('Error finding eligible donors:', error);
      return [];
    }
  }

  async hasRecentDonationRequest(userId, bloodType, cooldownHours = 12) {
    const since = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);

    const existing = await Notification.findOne({
      where: {
        user_id: userId,
        type: 'donation_request',
        action_url: `/schedule-donation?bloodType=${encodeURIComponent(bloodType)}`,
        created_at: {
          [Op.gte]: since,
        },
      },
    });

    return Boolean(existing);
  }

  async sendDonationRequests(bloodType, shortageAmount, location = null, options = {}) {
    try {
      const normalizedBloodType = this.normalizeBloodType(bloodType);
      const shortageUnits = Math.max(1, Number(shortageAmount || 0));
      const eligibleDonors = await this.findEligibleDonors(
        normalizedBloodType,
        Math.max(5, shortageUnits * 2),
        location
      );

      if (eligibleDonors.length === 0) {
        return {
          success: false,
          bloodType: normalizedBloodType,
          shortageAmount: shortageUnits,
          notificationsSent: 0,
          emailsSent: 0,
          smsSent: 0,
          whatsappSent: 0,
          skippedExisting: 0,
          eligibleDonorsFound: 0,
          message: 'No eligible donors found',
        };
      }

      let notificationsSent = 0;
      let emailsSent = 0;
      let smsSent = 0;
      let whatsappSent = 0;
      let skippedExisting = 0;

      for (const donor of eligibleDonors) {
        const alreadyNotified = await this.hasRecentDonationRequest(
          donor.user.id,
          normalizedBloodType,
          options.cooldownHours || 12
        );

        if (alreadyNotified) {
          skippedExisting += 1;
          continue;
        }

        await Notification.create({
          user_id: donor.user.id,
          type: 'donation_request',
          title: `Urgent request for ${normalizedBloodType} blood`,
          message: `A shortage of ${normalizedBloodType} blood has been predicted. Please consider donating if you are available and eligible.`,
          priority: shortageUnits >= 10 ? 'critical' : 'high',
          action_required: true,
          action_url: `/schedule-donation?bloodType=${encodeURIComponent(normalizedBloodType)}`,
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        notificationsSent += 1;

        if (donor.user.email) {
          try {
            const emailResult = await emailService.sendDonationRequestEmail({
              to: donor.user.email,
              donorName: donor.full_name,
              bloodType: normalizedBloodType,
              shortageAmount: shortageUnits,
              hospitalName: options.hospitalName || null,
            });

            if (emailResult.success) {
              emailsSent += 1;
            }
          } catch (emailError) {
            console.error(`Failed to send donation email to ${donor.user.email}:`, emailError);
          }
        }

        if (donor.phone) {
          try {
            const messageResult = await messageService.sendDonationRequestMessages({
              phone: donor.phone,
              donorName: donor.full_name,
              bloodType: normalizedBloodType,
              shortageAmount: shortageUnits,
              hospitalName: options.hospitalName || null,
            });

            if (messageResult.sms?.success) {
              smsSent += 1;
            }

            if (messageResult.whatsapp?.success) {
              whatsappSent += 1;
            }
          } catch (messageError) {
            console.error(`Failed to send donor messages to ${donor.phone}:`, messageError);
          }
        }
      }

      return {
        success: notificationsSent > 0,
        bloodType: normalizedBloodType,
        shortageAmount: shortageUnits,
        notificationsSent,
        emailsSent,
        smsSent,
        whatsappSent,
        skippedExisting,
        eligibleDonorsFound: eligibleDonors.length,
      };
    } catch (error) {
      console.error('Error sending donation requests:', error);
      return {
        success: false,
        bloodType: this.normalizeBloodType(bloodType),
        shortageAmount,
        notificationsSent: 0,
        emailsSent: 0,
        smsSent: 0,
        whatsappSent: 0,
        skippedExisting: 0,
        error: error.message,
      };
    }
  }

  async processShortageAlerts(alerts, options = {}) {
    const results = [];

    for (const rawAlert of alerts) {
      const alert = this.normalizeAlert(rawAlert);

      if (!alert.bloodType || alert.shortage <= 0) {
        continue;
      }

      const result = await this.sendDonationRequests(
        alert.bloodType,
        alert.shortage,
        alert.location,
        {
          cooldownHours: options.cooldownHours || 12,
          hospitalName: alert.hospitalName || options.hospitalName || null,
        }
      );

      results.push(result);
    }

    return results;
  }
}

module.exports = new DonorNotificationService();
