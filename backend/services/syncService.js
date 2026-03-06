const Order = require('../models/Order');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const AuditLog = require('../models/AuditLog');
const sequelize = require('../config/db');

const syncOrdersFromPlatforms = async () => {
    console.log("🔄 Syncing orders and updating inventory...");

    // Fetch all products to dynamically generate mock orders for existing SKUs
    const products = await Product.findAll();

    if (products.length === 0) {
        console.log("No products found in the database. Cannot generate mock orders.");
        return;
    }

    // Generate mock orders dynamically based on available products
    const mockExternalOrders = products.map((product, index) => {
        const platform_id = index % 2 === 0 ? 1 : 2; // Alternate between platforms
        const prefix = platform_id === 1 ? 'AMZ-' : 'FLP-';
        const quantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1 and 5
        const pricePerUnit = product.price || 500;

        return {
            platform_id,
            external_order_id: prefix + Math.floor(Math.random() * 10000),
            customer_name: "Customer " + Math.floor(Math.random() * 100),
            total_amount: pricePerUnit * quantity,
            quantity: quantity,
            sku: product.sku
        };
    });

    for (let rawOrder of mockExternalOrders) {
        const exists = await Order.findOne({ where: { external_order_id: rawOrder.external_order_id } });

        if (!exists) {
            // Check inventory First
            const product = await Product.findOne({ where: { sku: rawOrder.sku } });

            // If stock is depleted, we cannot accept/sync the order into our system
            if (product && product.total_stock >= rawOrder.quantity) {
                const t = await sequelize.transaction();
                try {
                    // 1. Create the Order
                    const newOrder = await Order.create({
                        platform_id: rawOrder.platform_id,
                        external_order_id: rawOrder.external_order_id,
                        customer_name: rawOrder.customer_name,
                        total_amount: rawOrder.total_amount,
                        order_status: 'Placed'
                    }, { transaction: t });

                    // 2. Create the OrderItem
                    await OrderItem.create({
                        order_id: newOrder.id,
                        product_id: product.id,
                        quantity: rawOrder.quantity,
                        price: product.price || (rawOrder.total_amount / rawOrder.quantity)
                    }, { transaction: t });

                    // 3. Deduct Stock from Inventory
                    product.total_stock -= rawOrder.quantity;
                    await product.save({ transaction: t });

                    // 4. Record Audit Log for successful sync
                    await AuditLog.create({
                        action: `Synced Order ${newOrder.id} (External: ${rawOrder.external_order_id}) for ${rawOrder.quantity}x ${rawOrder.sku}`,
                        module: 'Orders'
                    }, { transaction: t });

                    await t.commit();
                    console.log(`Successfully synced order ${newOrder.id}`);
                } catch (error) {
                    await t.rollback();
                    console.error(`Failed to sync order ${rawOrder.external_order_id}`, error);
                }
            } else {
                console.log(`Skipped syncing order ${rawOrder.external_order_id}: Insufficient stock for ${rawOrder.sku}`);
            }
        }
    }
};

module.exports = { syncOrdersFromPlatforms };