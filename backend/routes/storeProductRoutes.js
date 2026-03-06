const express = require('express');
const Product = require('../models/Product');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/store/products
// @desc    Get all products for the storefront
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let whereClause = {};

        if (category) {
            whereClause.category = category;
        }

        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        const products = await Product.findAll({
            where: whereClause,
            attributes: ['id', 'sku', 'name', 'price', 'total_stock', 'low_stock_threshold', 'category']
            // In a real app, an image URL column would be here too
        });

        // Add "low stock" flag before sending to frontend
        const productsWithStockFlags = products.map(p => {
            const productData = p.toJSON();
            // Flag if stock is low (e.g., threshold reached, but not zero)
            productData.isLowStock = (p.total_stock <= p.low_stock_threshold) && (p.total_stock > 0);
            productData.isOutOfStock = p.total_stock === 0;
            return productData;
        });

        res.json(productsWithStockFlags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/store/products/:id
// @desc    Get single product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: ['id', 'sku', 'name', 'price', 'total_stock', 'low_stock_threshold', 'category']
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productData = product.toJSON();
        productData.isLowStock = (product.total_stock <= product.low_stock_threshold) && (product.total_stock > 0);
        productData.isOutOfStock = product.total_stock === 0;

        res.json(productData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
