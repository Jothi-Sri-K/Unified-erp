const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./Customer');

const Address = sequelize.define('Address', {
    customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Customer,
            key: 'id'
        },
        allowNull: false
    },
    street: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'India' },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

Customer.hasMany(Address, { foreignKey: 'customer_id' });
Address.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = Address;
