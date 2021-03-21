const express = require("express");
const router = express.Router();
const log = console.log;
const chalk = require("chalk");
const bcrypt = require("bcryptjs");
const { Users } = require('../models/users');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


router.get('/', async (req, res) => {
    const data = await Users.find({}).select("-passwordHash");
    if(!data) return res.status(500).send("users not found");
    res.status(200).json(data);
});

router.get("/:id", async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({ success: false, err: "Invalid Id"});
    }
    try {
        const user = await Users.findById(req.params.id).select("name phone email");
        if(!user) return res.status(500).send("Cannot get the user id");
        res.status(200).json(user);
    } catch(err) {
        res.status(500).json({ success: false, err: err });
    }
});

router.put('/:id', async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Id");
    }
    const data = await Users.findByIdAndUpdate(req.params.id, {
        passwordHash: bcrypt.hashSync(req.body.password, 10)
    })
    if(!data) return res.status(500).send("users not found");
    res.status(200).json(data);
});

router.post('/', async (req, res) => {
    const users = new Users({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone:req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    try {
        const createdUser = await users.save();
        if(!createdUser) {
            return res.status(500).json({ success: false, err: "User could not be created"});
        }
        res.status(201).json(createdUser);
    } catch(err) {
        res.status(500).json({ err: err });
    }
});

router.post("/login", async (req, res) => {
    const user = await Users.findOne({ email: req.body.email });
    if(!user) return res.status(400).send("No user found");
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            process.env.SECRET,
            { expiresIn: '1d'}
        )
        res.status(200).json({ success: true, user: user.email, token: token, msg: "Authenticated"});
    } else {
        res.status(400).send("Password Incorrect!!");
    }
});


module.exports = router;