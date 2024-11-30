const mongoose = require('mongoose');
const Joi = require('joi');

// Address Schema with Mongoose validation
const addressSchema = mongoose.Schema({
  state: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  zip: {
    type: Number,
    required: true,
    min: 10000, // Assuming a 5-digit zip code
    max: 99999
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  }
});

// User Schema with Mongoose validation
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/  // Simple email validation
  },
  password: {
    type: String,
    minlength: 6
  },
  phone: {
    type: Number,
    minlength: 10, // Assuming a 10-digit phone number
    maxlength: 15  // Allowing up to 15 digits for international numbers
  },
  address: {
    type: [addressSchema],
    required: true
  }
}, { timestamps: true });

// Joi Validation Schema
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
    phone: Joi.number().min(1000000000).max(999999999999999), // 10-15 digit phone number
    address: Joi.array().items(
      Joi.object({
        state: Joi.string().min(2).max(50).required(),
        zip: Joi.number().min(10000).max(99999).required(),
        city: Joi.string().min(2).max(50).required()
      })
    ).required()
  });

  return schema.validate(user);
}

module.exports = {
  userModel: mongoose.model('user', userSchema),
  validateUser
};
