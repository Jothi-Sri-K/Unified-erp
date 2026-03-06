const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    sku: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    total_stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: { type: DataTypes.DECIMAL(10, 2) },
    low_stock_threshold: { type: DataTypes.INTEGER, defaultValue: 10 },
    category: { type: DataTypes.STRING },
    supplier_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Suppliers', // Assumes Supplier model table is named 'Suppliers'
            key: 'id'
        },
        allowNull: true // Can be set later
    }
}, {
    timestamps: true // Set this to true
});

module.exports = Product;