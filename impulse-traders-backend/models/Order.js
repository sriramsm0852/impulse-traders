// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'UPI', 'Card']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    status: {
        type: String,
        required: true,
        enum: ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    address: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        addressLine: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        landmark: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
