const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema with validation
const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  products: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  TotalPrice: {
    type: Number,
    required: true,
    min: 0  // Ensuring the total price is not negative
  },
  address: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 255
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],  // Enum for predefined statuses
    default: "pending"
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
    required: true
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "delivery",
    required: true
  }
});

// Joi Validation Schema
function validateOrder(order) {
  const schema = Joi.object({
    user: Joi.string().required(),  // Assuming user ID is a string
    products: Joi.string().required(),  // Assuming product ID is a string
    TotalPrice: Joi.number().min(0).required(),
    address: Joi.string().min(10).max(255).required(),
    status: Joi.string().valid("pending", "confirmed", "shipped", "delivered", "cancelled").required(),
    payment: Joi.string().required(),  // Assuming payment ID is a string
    delivery: Joi.string().required(),  // Assuming delivery ID is a string
  });

  return schema.validate(order);
}

module.exports = {
  Order: mongoose.model('order', orderSchema),
  validateOrder
};
