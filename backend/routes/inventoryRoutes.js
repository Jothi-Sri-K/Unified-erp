const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { adjustStock } = require('../services/inventoryService');

// Get All Products
router.get('/', authMiddleware, async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Product
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager', 'Warehouse']), async (req, res) => {
    try {
        let { sku, name, price, low_stock_threshold, category, supplier_id } = req.body;

        // Strip whitespace
        sku = sku?.trim();
        name = name?.trim();
        category = category?.trim();

        if (!sku || !name || !price) {
            return res.status(400).json({ message: "SKU, Name, and Price are required" });
        }

        // Basic SKU validation (e.g., Alphanumeric and dashes only)
        if (!/^[a-zA-Z0-9-]+$/.test(sku)) {
            return res.status(400).json({ message: "Invalid SKU format. Use only letters, numbers, and dashes." });
        }

        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
            return res.status(400).json({ message: "Product with this SKU already exists" });
        }

        const product = await Product.create({
            sku,
            name,
            price,
            low_stock_threshold: low_stock_threshold || 10,
            category: category || 'General',
            supplier_id: supplier_id || null,
            total_stock: 0
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manual Stock Adjustment
router.post('/adjust', authMiddleware, roleMiddleware(['Admin', 'Warehouse', 'Manager']), async (req, res) => {
    try {
        const { productId, adjustmentAmount, reason } = req.body;

        if (!productId || !adjustmentAmount || !reason) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await adjustStock(productId, Number(adjustmentAmount), reason, req.user.id);
        res.json({ message: "Stock adjusted successfully", newStock: result.newStock });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
