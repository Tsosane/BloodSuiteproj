// src/models/Donor.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Donor = sequelize.define('Donor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
  },
  last_donation_date: {
    type: DataTypes.DATEONLY,
  },
  is_eligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  donation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  medical_history: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'donors',
});

// Calculate eligibility based on 56-day rule
Donor.prototype.calculateEligibility = function() {
  if (!this.last_donation_date) {
    return { is_eligible: true, next_eligible_date: null, days_remaining: 0 };
  }
  
  const today = new Date();
  const lastDonation = new Date(this.last_donation_date);
  const daysSinceDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
  
  if (daysSinceDonation >= 56) {
    return { is_eligible: true, next_eligible_date: null, days_remaining: 0 };
  } else {
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(lastDonation.getDate() + 56);
    return { 
      is_eligible: false, 
      next_eligible_date: nextEligible.toISOString().split('T')[0],
      days_remaining: 56 - daysSinceDonation
    };
  }
};

// Auto-update eligibility before saving
Donor.beforeSave(async (donor) => {
  const eligibility = donor.calculateEligibility();
  donor.is_eligible = eligibility.is_eligible;
});

Donor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Donor, { foreignKey: 'user_id', as: 'donor' });

module.exports = Donor;