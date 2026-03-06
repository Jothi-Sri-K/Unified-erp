const express = require('express');
const Address = require('../models/Address');
const storeAuthMiddleware = require('../middleware/storeAuthMiddleware');

const router = express.Router();
router.use(storeAuthMiddleware);

// @route   GET /api/store/user/addresses
// @desc    Get all addresses for a customer
router.get('/addresses', async (req, res) => {
    try {
        const addresses = await Address.findAll({ where: { customer_id: req.customer.id } });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/store/user/addresses
// @desc    Add a new address
router.post('/addresses', async (req, res) => {
    try {
        const { street, city, state, zipCode, country, isDefault } = req.body;

        // Reset default logically
        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { customer_id: req.customer.id } });
        }

        const address = await Address.create({
            customer_id: req.customer.id,
            street, city, state, zipCode, country,
            isDefault: isDefault || false
        });

        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/store/user/addresses/:id/default
// @desc    Set address as default
router.put('/addresses/:id/default', async (req, res) => {
    try {
        const address = await Address.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        await Address.update({ isDefault: false }, { where: { customer_id: req.customer.id } });
        address.isDefault = true;
        await address.save();

        res.json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/store/user/addresses/:id
// @desc    Update an existing address
router.put('/addresses/:id', async (req, res) => {
    try {
        const { street, city, state, zipCode, country } = req.body;
        const address = await Address.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        await address.update({ street, city, state, zipCode, country });
        res.json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
