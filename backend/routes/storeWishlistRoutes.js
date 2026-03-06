const express = require('express');
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');
const storeAuthMiddleware = require('../middleware/storeAuthMiddleware');

const router = express.Router();
router.use(storeAuthMiddleware);

const getWishlist = async (customerId) => {
    let wishlist = await Wishlist.findOne({ where: { customer_id: customerId } });
    if (!wishlist) {
        wishlist = await Wishlist.create({ customer_id: customerId });
    }
    return wishlist;
};

// @route   GET /api/store/wishlist
// @desc    Get current user's wishlist
router.get('/', async (req, res) => {
    try {
        const wishlist = await getWishlist(req.customer.id);

        const items = await WishlistItem.findAll({
            where: { wishlist_id: wishlist.id },
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

// @route   POST /api/store/wishlist/add
// @desc    Add item to wishlist
router.post('/add', async (req, res) => {
    try {
        const { product_id } = req.body;

        const product = await Product.findByPk(product_id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const wishlist = await getWishlist(req.customer.id);

        let item = await WishlistItem.findOne({
            where: { wishlist_id: wishlist.id, product_id }
        });

        if (item) {
            return res.status(400).json({ message: "Item already in wishlist" });
        }

        item = await WishlistItem.create({
            wishlist_id: wishlist.id,
            product_id
        });

        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/store/wishlist/remove/:id
// @desc    Remove item from wishlist
router.delete('/remove/:id', async (req, res) => {
    try {
        const item = await WishlistItem.findOne({
            where: { product_id: req.params.id, wishlist_id: (await getWishlist(req.customer.id)).id }
        });

        if (!item) {
            return res.status(404).json({ message: "Item not found in wishlist" });
        }

        await item.destroy();
        res.json({ message: "Item removed from wishlist" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
