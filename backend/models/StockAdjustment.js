const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');
const User = require('./User');

const StockAdjustment = sequelize.define('StockAdjustment', {
    adjustment_amount: { type: DataTypes.INTEGER, allowNull: false },
    previous_stock: { type: DataTypes.INTEGER, allowNull: false },
    new_stock: { type: DataTypes.INTEGER, allowNull: false },
    reason: {
        type: DataTypes.ENUM('Restock', 'Damaged', 'Return', 'Correction'),
        allowNull: false
    }
}, {
    timestamps: true
});

// Associations
StockAdjustment.belongsTo(Product, { foreignKey: 'product_id' });
StockAdjustment.belongsTo(User, { foreignKey: 'user_id' });

module.exports = StockAdjustment;
