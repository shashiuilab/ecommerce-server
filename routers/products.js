const express = require("express");
const router = express.Router();
const log = console.log;
const chalk = require("chalk");
const { Product } = require('../models/products');
const { Category } = require("../models/categories");
const mongoose = require("mongoose");

const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

router.post('/', async (req, res) => {
    const checkForCategory = await Category.findById(req.body.category);
    if(!checkForCategory) {
        return res.status(500).send("Invalid Category");
    }
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numberOfReviews: req.body.numberOfReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated
    });
    
    const createdProduct = await product.save();

    if(!createdProduct) return res.status(500).json("Product cannot be created");
    res.status(201).json(createdProduct);
});

router.get('/', async (req, res) => {
    const data = await Product.find({});
    log(chalk.cyan(data));
    res.status(200).json(data);
});

router.get('/:id', async (req, res) => {
    const data = await Product.findById(req.params.id).populate("category");
    res.status(200).json(data);
})

router.get('/get/bycategory', async (req, res) => {
    let filter = {};
    if(req.query?.categories?.split(',')) {
        filter = { category: req.query.categories.split(',') }
    }

    const data = await Product.find(filter);
    res.status(200).json(data);
})

router.put('/:id', async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, err: "cannot find product with id"});
    }
    const data = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        isFeatured: req.body.isFeatured
    }, { new: true });
    res.status(200).json(data);
})

router.delete('/:id', (req, res) => {
    const data = Product.findByIdAndDelete(req.params.id).then(deletedProduct => {
        log(chalk.green(`deleted product ${deletedProduct}`));
        res.json(deletedProduct);
    }).catch(err => {
        res.status(404).json({ success: false, err: err });
    })
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);
    if(!productCount) return res.status(500).send("No products found");
    res.json({ count: productCount });
});

router.get('/get/featured', async (req, res) => {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(1);
    if(!featuredProducts) return res.status(500).send("No products found");
    res.json(featuredProducts);
});

router.put('/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)


module.exports = router;