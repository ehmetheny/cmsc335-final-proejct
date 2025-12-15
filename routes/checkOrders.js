const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Order = require('../model/Order');

router.get("/", async (req, res) => {

    (async () => {
        try {
            await mongoose.connect(process.env.MONGO_CONNECTION_STRING, { dbName: 'CMSC335DB' });
            
            const { getFlowers } = require("../internationalFlowers");

            const ordersList = await Order.find({}).sort({ date: -1 });

            let tableBody = "";

            ordersList.forEach((order) => {
                const orders = {
                    gw: order.gw,
                    iris: order.iris,
                    lotus: order.lotus,
                    cb: order.cb,
                    jasmine: order.jasmine,
                    sunflower: order.sunflower
                };
                tableBody += `<tr><td>DATE<strong>${order.date.toLocaleString()} UTC</strong></td></tr>`;
                tableBody += `<tr><td>E-MAIL ADDRESS<strong>${order.email}</strong></td></tr>`;
                tableBody += `<tr><td>PHONE NUMBER<strong>${order.phone}</strong></td></tr>`;
                tableBody += `<tr><td>NAME<strong>${order.name}</strong></td></tr>`;
                tableBody += `<tr><td>ADDRESS<strong>${order.address}</strong></td></tr>`;
                tableBody += `<tr><td>COUNTRY<strong>${order.country}</strong></td></tr>`;
                tableBody += `<tr><td>FLOWERS<strong>${getFlowers(orders)}</strong></td></tr>`;
                tableBody += `<tr><td>TOTAL<strong>${order.total}</strong></td></tr>`;
                tableBody += `<tr class="space"><td></td></tr>`;
            });
            res.render("orders", { tbody: tableBody });

        } catch (e) {
            console.error("Error in /orders get:", e);
        } finally {
            mongoose.disconnect();
        }
    })();
});

module.exports = router;