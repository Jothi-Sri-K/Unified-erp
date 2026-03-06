const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const OrderItem = require('./models/OrderItem');

const roleMiddleware = require('./middleware/roleMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const { syncOrdersFromPlatforms } = require('./services/syncService');
const Order = require('./models/Order');
const AuditLog = require('./models/AuditLog');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/auth', authRoutes);

// Protected Order Route (Requires Login & Specific Roles)
app.get('/api/orders', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Sales', 'Warehouse']), async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
});

// Manual Sync Trigger
app.post('/api/sync', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
    try {
        await syncOrdersFromPlatforms();
        res.json({ message: "Sync successful" });
    } catch (err) {
        console.error("Sync Error:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

// --- Analytics Route ---
// --- Analytics Route ---
app.get('/api/analytics', authMiddleware, roleMiddleware(['Admin', 'Manager']), async (req, res) => {
    try {
        const [orders, products] = await Promise.all([
            Order.findAll(),
            Product.findAll()
        ]);

        const totalOrders = orders.length;

        // Use Number() to ensure we aren't adding strings
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + Number(order.total_amount || 0);
        }, 0);

        const amazonOrders = orders.filter(o => o.platform_id === 1).length;
        const flipkartOrders = orders.filter(o => o.platform_id === 2).length;

        // Calculate Order Statuses
        const statusMap = {};
        orders.forEach(o => {
            const status = o.order_status || 'Unknown';
            statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const orderStatus = Object.keys(statusMap).map(key => ({
            name: key,
            value: statusMap[key]
        }));

        res.json({
            totalOrders,
            totalRevenue: totalRevenue.toFixed(2), // Keep 2 decimal places
            amazonOrders,
            flipkartOrders,
            orderStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notifications', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Warehouse']), async (req, res) => {
    // Dynamically compare using MySQL column references
    const lowStockProducts = await Product.findAll({
        where: sequelize.where(
            sequelize.col('total_stock'),
            '<',
            sequelize.col('low_stock_threshold')
        )
    });

    // De-duplicate / logic can be applied here later. For now, we return valid alerts based on the individual threshold.
    res.json(lowStockProducts.map(p => `Low Stock Alert: ${p.name} (${p.total_stock} left, needs ${p.low_stock_threshold})`));
});

app.put('/api/orders/:id/status', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Warehouse', 'Sales']), async (req, res) => {
    const { status } = req.body; // e.g., 'Packed', 'Shipped'
    await Order.update({ order_status: status }, { where: { id: req.params.id } });

    // Gap 5: Audit Log
    await AuditLog.create({
        user_id: req.user.id,
        action: `Changed Order ${req.params.id} status to ${status}`,
        module: 'Orders'
    });

    res.json({ message: "Order status updated" });
});

const PORT = process.env.PORT || 5000;

// ============================================
// E-COMMERCE ENDPOINTS
// ============================================

// Import Store Routes
const storeAuthRoutes = require('./routes/storeAuthRoutes');
const storeUserRoutes = require('./routes/storeUserRoutes');
const storeProductRoutes = require('./routes/storeProductRoutes');
const storeCartRoutes = require('./routes/storeCartRoutes');
const storeWishlistRoutes = require('./routes/storeWishlistRoutes');
const storeOrderRoutes = require('./routes/storeOrderRoutes');

// Mount Store Routes
app.use('/api/store/auth', storeAuthRoutes);
app.use('/api/store/user', storeUserRoutes);
app.use('/api/store/products', storeProductRoutes);
app.use('/api/store/cart', storeCartRoutes);
app.use('/api/store/wishlist', storeWishlistRoutes);
app.use('/api/store/orders', storeOrderRoutes);

// Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
    console.error('Sequelize Sync Error:', err);
});