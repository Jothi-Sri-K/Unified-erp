const sequelize = require('../config/db');
const Product = require('../models/Product');
const StockAdjustment = require('../models/StockAdjustment');
const AuditLog = require('../models/AuditLog');

const adjustStock = async (productId, amount, reason, userId) => {
    const t = await sequelize.transaction();

    try {
        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
            throw new Error('Product not found');
        }

        const newStock = product.total_stock + amount;
        if (newStock < 0) {
            throw new Error(`Insufficient stock. Current: ${product.total_stock}, Requested reduction: ${Math.abs(amount)}`);
        }

        // 1. Update Product Stock
        const previousStock = product.total_stock;
        await product.update({ total_stock: newStock }, { transaction: t });

        // 2. Record Adjustment
        await StockAdjustment.create({
            product_id: productId,
            user_id: userId,
            adjustment_amount: amount,
            previous_stock: previousStock,
            new_stock: newStock,
            reason: reason
        }, { transaction: t });

        // 3. Create Audit Log
        await AuditLog.create({
            user_id: userId,
            action: `Adjusted stock for ${product.name} (SKU: ${product.sku}) by ${amount}. Old Stock: ${previousStock}, New Stock: ${newStock}. Reason: ${reason}`,
            module: 'Inventory'
        }, { transaction: t });

        await t.commit();
        return { success: true, newStock };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

module.exports = { adjustStock };
