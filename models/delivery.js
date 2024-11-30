const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema with validation
const deliverySchema = mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "shipped", "delivered", "cancelled"], // Enum for predefined statuses
    default: "pending"
  },
  deliveryBoy: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  trackingUrl: {
    type: String,
    required: false,
    match: /https?:\/\/(www\.)?\w+\.\w+/, // Simple URL validation
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true,
    min: 1 // Minimum of 1 minute for delivery time
  }
});

// Joi Validation Schema
function validateDelivery(delivery) {
  const schema = Joi.object({
    order: Joi.string().required(),  // Assuming order ID is a string
    status: Joi.string().valid("pending", "shipped", "delivered", "cancelled").required(),
    deliveryBoy: Joi.string().min(3).max(50).required(),
    trackingUrl: Joi.string().uri().allow(null, ''),  // URL or can be empty
    estimatedDeliveryTime: Joi.number().min(1).required()
  });

  return schema.validate(delivery);
}

module.exports = {
  Delivery: mongoose.model('delivery', deliverySchema),
  validateDelivery
};
