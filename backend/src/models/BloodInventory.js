// src/models/BloodInventory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Hospital = require('./Hospital');
const Donor = require('./Donor');

const BloodInventory = sequelize.define('BloodInventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hospital_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id',
    },
  },
  donor_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'donors',
      key: 'id',
    },
  },
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  quantity_ml: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  collection_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  storage_location: {
    type: DataTypes.STRING,
  },
  testing_status: {
    type: DataTypes.ENUM('pending', 'passed', 'failed'),
    defaultValue: 'pending',
  },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'expired', 'used'),
    defaultValue: 'available',
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'blood_inventory',
  indexes: [
    { fields: ['expiry_date'] },
    { fields: ['status', 'blood_type'] },
  ],
});

// FEFO: Get available units ordered by expiry date
BloodInventory.addScope('fefo', {
  where: { status: 'available' },
  order: [['expiry_date', 'ASC']],
});

BloodInventory.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
BloodInventory.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });
Hospital.hasMany(BloodInventory, { foreignKey: 'hospital_id', as: 'inventory' });
Donor.hasMany(BloodInventory, { foreignKey: 'donor_id', as: 'donations' });

module.exports = BloodInventory;