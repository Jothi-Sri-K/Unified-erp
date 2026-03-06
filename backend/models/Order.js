const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    platform_id: DataTypes.INTEGER,
    external_order_id: DataTypes.STRING,
    customer_name: DataTypes.STRING,
    total_amount: DataTypes.DECIMAL(10, 2),
    order_status: DataTypes.ENUM('Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')
}, { 
    timestamps: true // Set this to true
});

module.exports = Order;