const express = require("express");
const router = express.Router();
const log = console.log;
const chalk = require("chalk");
const { Category } = require('../models/categories');

router.get('/', async (req, res) => {
    const data = await Category.find({});
    if(!data) res.status(404).json({ success: false, msg: "Did not find category"});
    res.status(200).json(data);
});

router.post('/', async (req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    const createdCategory = await category.save();
    if(!createdCategory) {
        res.status(500).json({ success: false, msg: 'Category is not added'})
    }
    res.status(201).json(createdCategory);
});

router.get('/:id', async (req, res) => {
    const data = await Category.findById(req.params.id);
    res.status(200).json(data);
})

router.put('/:id', async (req, res) => {
    const data = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, { new: true });
    res.status(200).json(data);
})

router.delete('/:id', (req, res) => {
    const data = Category.findByIdAndDelete(req.params.id).then(deletedCategory => {
        log(chalk.green(`deleted category ${deletedCategory}`));
        res.json(deletedCategory);
    }).catch(err => {
        res.status(404).json({ success: false, err: err });
    })
})


module.exports = router;