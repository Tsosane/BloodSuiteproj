// src/models/Request.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Hospital = require('./Hospital');
const BloodInventory = require('./BloodInventory');

const Request = sequelize.define('Request', {
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
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  quantity_ml: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 450,
    },
  },
  urgency: {
    type: DataTypes.ENUM('routine', 'urgent', 'emergency'),
    defaultValue: 'routine',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'fulfilled', 'cancelled'),
    defaultValue: 'pending',
  },
  patient_name: {
    type: DataTypes.STRING,
  },
  patient_age: {
    type: DataTypes.INTEGER,
  },
  patient_blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  },
  required_date: {
    type: DataTypes.DATEONLY,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  fulfilled_from: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'blood_inventory',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'requests',
});

Request.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
Request.belongsTo(BloodInventory, { foreignKey: 'fulfilled_from', as: 'fulfilledUnit' });
Hospital.hasMany(Request, { foreignKey: 'hospital_id', as: 'requests' });

module.exports = Request;