const express = require('express');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const storeAuthMiddleware = require('../middleware/storeAuthMiddleware');

const router = express.Router();

// Middleware ensures only logged-in customers can access
router.use(storeAuthMiddleware);

// Helper: Ensure Cart Exists
const getCart = async (customerId) => {
    let cart = await Cart.findOne({ where: { customer_id: customerId } });
    if (!cart) {
        cart = await Cart.create({ customer_id: customerId });
    }
    return cart;
};

// @route   GET /api/store/cart
// @desc    Get current user's cart
router.get('/', async (req, res) => {
    try {
        const cart = await getCart(req.customer.id);

        const items = await CartItem.findAll({
            where: { cart_id: cart.id },
            include: [{
                model: Product,
                attributes: ['id', 'name', 'price', 'total_stock']
            }]
        });

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/store/cart/add
// @desc    Add item to cart
router.post('/add', async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product || product.total_stock < quantity) {
            return res.status(400).json({ message: "Not enough stock" });
        }

        const cart = await getCart(req.customer.id);

        let item = await CartItem.findOne({
            where: { cart_id: cart.id, product_id }
        });

        if (item) {
            // Check if adding exceeds stock
            if (product.total_stock < (item.quantity + quantity)) {
                return res.status(400).json({ message: "Cannot add more. Exceeds available stock." });
            }
            item.quantity += quantity;
            await item.save();
        } else {
            item = await CartItem.create({
                cart_id: cart.id,
                product_id,
                quantity
            });
        }

        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/store/cart/update/:id
// @desc    Update cart item quantity
router.put('/update/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await CartItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        const cart = await getCart(req.customer.id);
        if (item.cart_id !== cart.id) return res.status(401).json({ message: "Unauthorized" });

        const product = await Product.findByPk(item.product_id);
        if (product.total_stock < quantity) {
            return res.status(400).json({ message: `Only ${product.total_stock} left in stock` });
        }

        item.quantity = quantity;
        await item.save();

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/store/cart/remove/:id
// @desc    Remove item from cart
router.delete('/remove/:id', async (req, res) => {
    try {
        const item = await CartItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const cart = await getCart(req.customer.id);
        if (item.cart_id !== cart.id) return res.status(401).json({ message: "Unauthorized" });

        await item.destroy();
        res.json({ message: "Item removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
