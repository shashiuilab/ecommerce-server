const mongoose = require('mongoose');

const categoriesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: ''
    },
    icon: {
        type: String
    }
})

const Category = mongoose.model('Category', categoriesSchema);

exports.Category = Category;