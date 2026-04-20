const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const ImportLog = sequelize.define('ImportLog', {
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
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source_type: {
    type: DataTypes.ENUM('csv', 'xlsx', 'xls'),
    allowNull: false,
  },
  total_records: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  inserted_records: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  skipped_records: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('success', 'partial', 'failed'),
    allowNull: false,
    defaultValue: 'success',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'import_logs',
});

ImportLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ImportLog, { foreignKey: 'user_id', as: 'importLogs' });

module.exports = ImportLog;
