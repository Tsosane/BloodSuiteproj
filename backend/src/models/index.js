// src/models/index.js
const User = require('./User');
const Donor = require('./Donor');
const Hospital = require('./Hospital');
const BloodInventory = require('./BloodInventory');
const Request = require('./Request');
const Notification = require('./Notification');
const ImportLog = require('./ImportLog');

module.exports = {
  User,
  Donor,
  Hospital,
  BloodInventory,
  Request,
  Notification,
  ImportLog,
};
