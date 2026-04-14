// src/utils/constants.js
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['routine', 'urgent', 'emergency'];
const REQUEST_STATUSES = ['pending', 'processing', 'fulfilled', 'cancelled'];
const INVENTORY_STATUSES = ['available', 'reserved', 'expired', 'used'];
const USER_ROLES = ['admin', 'hospital', 'donor', 'blood_bank_manager'];

module.exports = {
  BLOOD_TYPES,
  URGENCY_LEVELS,
  REQUEST_STATUSES,
  INVENTORY_STATUSES,
  USER_ROLES,
};