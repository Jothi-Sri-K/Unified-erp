const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

const router = express.Router();

// Email Transporter (Update with real credentials for production)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', // Replace with real SMTP
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', // Replace with real Ethereal or SMTP user
        pass: 'ethereal_password'             // Replace with real Ethereal or SMTP pass
    }
});

// Helper: In a real app, you'd generate a real ethereal account programmatically 
// or use environment variables. For now, we will simulate the send.

// @route   POST /api/store/auth/signup
// @desc    Register a customer
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const exists = await Customer.findOne({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: "Customer already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const customer = await Customer.create({
            name,
            email,
            password: hashedPassword,
            phone,
            verificationToken
        });

        // Initialize Cart and Wishlist
        await Cart.create({ customer_id: customer.id });
        await Wishlist.create({ customer_id: customer.id });

        // Generate Verification URL
        const verifyUrl = `http://localhost:5000/api/store/auth/verify/${verificationToken}`;

        // Simulating email send. In production, uncomment the transporter.sendMail
        console.log(`[EMAIL SIMULATION] Verification Email sent to ${email}. Link: ${verifyUrl}`);
        /*
        await transporter.sendMail({
            from: '"Unified ERP Store" <noreply@erpstore.com>',
            to: email,
            subject: "Verify your email",
            text: `Please verify your email by clicking: ${verifyUrl}`
        });
        */

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account."
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/store/auth/verify/:token
// @desc    Verify customer email
router.get('/verify/:token', async (req, res) => {
    try {
        const customer = await Customer.findOne({ where: { verificationToken: req.params.token } });
        if (!customer) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        customer.isVerified = true;
        customer.verificationToken = null;
        await customer.save();

        // Redirect to frontend login on success
        res.redirect('http://localhost:3001/login?verified=true'); // Adjust port if needed
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/store/auth/login
// @desc    Login customer
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // Optional: Enforce email verification
        // if (!customer.isVerified) {
        //     return res.status(403).json({ message: "Please verify your email first." });
        // }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: customer.id, type: 'customer' }, // Differentiate from staff token
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                isVerified: customer.isVerified
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
