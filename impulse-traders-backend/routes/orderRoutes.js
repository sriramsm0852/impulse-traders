// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', async (req, res) => {
    const order = new Order({
        userId: req.body.userId,
        products: req.body.products,
        totalAmount: req.body.totalAmount,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentMethod === 'COD' ? 'Pending' : 'Paid',
        status: 'Placed',
        address: req.body.address
    });

    try {
        const newOrder = await order.save();
        
        // Add order to user's orders array
        await User.findByIdAndUpdate(
            req.body.userId,
            { $push: { orders: newOrder._id } }
        );

        // Populate the products information for the response
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('products.product');
        
        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.patch('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (req.body.status) order.status = req.body.status;
        if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
