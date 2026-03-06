const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const storeAuthMiddleware = require('../middleware/storeAuthMiddleware');

const router = express.Router();

// Email Transporter (Update with real credentials for production)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal_password'
    }
});

// Helper: Generate PDF Invoice Buffer
const generateInvoice = async (order, items, customer) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            doc.fontSize(20).text('INVOICE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Order ID: ${order.external_order_id}`);
            doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
            doc.text(`Customer Name: ${order.customer_name}`);
            doc.text(`Email: ${customer.email}`);
            doc.moveDown();

            doc.text('Items:', { underline: true });
            doc.moveDown();

            items.forEach(item => {
                doc.text(`${item.Product.name} - Qty: ${item.quantity} - $${item.price}`);
            });

            doc.moveDown();
            doc.fontSize(14).text(`Total Amount: $${order.total_amount}`, { align: 'right' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

router.use(storeAuthMiddleware);

// @route   POST /api/store/orders/checkout
// @desc    Process checkout and place order
router.post('/checkout', async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const customer = await Customer.findByPk(req.customer.id);
        const { shippingDetails } = req.body; // Expect frontend to send shipping address, etc.

        const cart = await Cart.findOne({ where: { customer_id: customer.id } });
        if (!cart) throw new Error("Cart not found");

        const cartItems = await CartItem.findAll({
            where: { cart_id: cart.id },
            include: [Product]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let orderTotal = 0;

        // 1. Verify Stock for all items first
        for (let item of cartItems) {
            if (item.Product.total_stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.Product.name}. Only ${item.Product.total_stock} left.`);
            }
            orderTotal += (item.Product.price * item.quantity);
        }

        // 2. Create the ERP Order Record
        const newOrder = await Order.create({
            platform_id: 3, // Storefront
            external_order_id: `STORE-${Date.now()}`,
            customer_name: customer.name,
            total_amount: orderTotal,
            order_status: 'Placed'
        }, { transaction: t });

        // 3. Process line items, deduct stock, create OrderItems
        for (let item of cartItems) {
            await OrderItem.create({
                order_id: newOrder.id,
                product_id: item.Product.id,
                quantity: item.quantity,
                price: item.Product.price
            }, { transaction: t });

            // Deduct from Product Inventory
            await Product.update(
                { total_stock: item.Product.total_stock - item.quantity },
                { where: { id: item.Product.id }, transaction: t }
            );
        }

        // 4. Clear the Cart
        await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });

        // 5. Audit Log
        await AuditLog.create({
            user_id: null, // System / E-commerce customer
            action: `Storefront Order Placed: ${newOrder.external_order_id} by ${customer.name}`,
            module: 'Orders'
        }, { transaction: t });

        await t.commit();

        // 6. Generate Invoice and Email (Async, non-blocking for response)
        try {
            // Re-fetch created order items with product details for PDF
            const savedOrderItems = await OrderItem.findAll({
                where: { order_id: newOrder.id },
                include: [Product]
            });

            const pdfBuffer = await generateInvoice(newOrder, savedOrderItems, customer);

            console.log(`[EMAIL SIMULATION] Invoice generated and sent to ${customer.email} for Order ${newOrder.external_order_id}`);
            /*
            await transporter.sendMail({
                from: '"Unified ERP Store" <noreply@erpstore.com>',
                to: customer.email,
                subject: `Invoice for Order ${newOrder.external_order_id}`,
                text: "Thank you for your purchase! Please find your invoice attached.",
                attachments: [
                    {
                        filename: `invoice_${newOrder.external_order_id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });
            */
        } catch (emailError) {
            console.error("Failed to generate or send email invoice:", emailError);
            // We don't fail the order if the email fails, but we log it.
        }

        res.json({ success: true, message: "Order placed successfully!", orderId: newOrder.external_order_id });

    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
});

// @route   GET /api/store/orders
// @desc    Get customer's past orders
router.get('/', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.customer.id);

        const orders = await Order.findAll({
            where: { customer_name: customer.name, platform_id: 3 }, // Very basic linkage for this scope
            order: [['createdAt', 'DESC']],
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
