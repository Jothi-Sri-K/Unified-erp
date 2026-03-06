const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); // Import User for association

const AuditLog = sequelize.define('AuditLog', {
    action: { type: DataTypes.STRING },
    module: { type: DataTypes.STRING }, // e.g., 'Inventory', 'Orders'
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    timestamps: false
});

// Association
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = AuditLog;
