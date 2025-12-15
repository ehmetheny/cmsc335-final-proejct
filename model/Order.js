const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    gw: {
        type: Number,
        required: true,
    },
    iris: {
        type: Number,
        required: true,
    },
    lotus: {
        type: Number,
        required: true,
    },
    cb: {
        type: Number,
        required: true,
    },
    jasmine: {
        type: Number,
        required: true,
    },
    sunflower: {
        type: Number,
        required: true,
    },
    total: {
        type: String,
        required: true,
    }
});

const Order = mongoose.model("Order", ordersSchema, 'flowerOrders');
module.exports = Order;