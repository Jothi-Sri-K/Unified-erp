const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Customer = require('./Customer');

const Wishlist = sequelize.define('Wishlist', {
    customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Customer,
            key: 'id'
        },
        allowNull: false,
        unique: true // One wishlist per customer
    }
}, { timestamps: true });

Customer.hasOne(Wishlist, { foreignKey: 'customer_id' });
Wishlist.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = Wishlist;
