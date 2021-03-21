const express = require("express");
const router = express.Router();
const log = console.log;
const chalk = require("chalk");
const { OrderItem } = require('../models/orderItem');
const { Order } = require('../models/orders');

router.get('/', async (req, res) => {
    const orderDetails = await Order.find({}).populate("user").sort({ dateOrdered: -1 });
    log(chalk.cyan(orderDetails));
    res.status(200).json(orderDetails);
});

router.get('/:id', async (req, res) => {
    const orderDetails = await Order.findById(req.params.id).populate("user", "name")
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!orderDetails) res.status(500).send("cannot find order details");
    res.status(200).json(orderDetails);
});

router.post('/', async (req, res) => {

    const orderItemIds = Promise.all(req.body.orderItems.map(async orderItem => {
        const newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        const newCreatedOrderItem = await newOrderItem.save();
        return newCreatedOrderItem._id;
    }));
    
    
    const resolvedOrderIds = await orderItemIds;

    const totalPrices = await Promise.all(resolvedOrderIds.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);
    let order = new Order({
        orderItems: resolvedOrderIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });
    order = await order.save();
    if(!order) res.status(500).send("order cannot be created");
    res.status(200).json(order);
});

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
});

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
});

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
});


module.exports = router;