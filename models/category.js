const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema with validation
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true,  // Ensuring that category names are unique
  }
});

// Joi Validation Schema
function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
  });

  return schema.validate(category);
}

module.exports = {
  categoryModel: mongoose.model('category', categorySchema),
  validateCategory,
};
