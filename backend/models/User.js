const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Sales', 'Warehouse', 'Manager'), defaultValue: 'Admin' },
    status: { type: DataTypes.ENUM('ACTIVE', 'DISABLED'), defaultValue: 'ACTIVE' }
}, { timestamps: true });

module.exports = User;