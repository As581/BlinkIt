const mongoose = require('mongoose');
const Joi = require('joi');

const productSchema =  mongoose.Schema({
    name: {
        type: String,
        required: true, // Product name is required
    },
    price: {
        type: Number,
        required: true, // Price is required
    },
    stocks: {
        type: Number, // Stock count as a Number
        required: true,// Stock is required
    },
    description: String, // Optional field
    image: Buffer, // Image stored as a Buffer
    category: {
        type: String,
        required: true, // Category is required
    }
}, { timestamps: true });

function validateProduct(data) {
    const Schema = Joi.object({
        name: Joi.string().trim().required(),
        price: Joi.number().min(0).required(),
        stocks: Joi.number().required(),
        description: Joi.string().trim(),
        image: Joi.string().optional(),
        category: Joi.string().trim().required(),
    });
    return Schema.validate(data);
}

const productModel = mongoose.model('products', productSchema);

module.exports = {
    productModel,
    validateProduct,
};
