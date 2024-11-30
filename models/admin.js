const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const adminSchema = mongoose.Schema({
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
    match: /.+\@.+\..+/ // simple regex for email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'superadmin'] // only allow 'admin' or 'superadmin'
  }
});

// Mongoose Model
const adminModel= mongoose.model('Admin', adminSchema);

// Joi Validation Function
function validateAdmin(admin) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'superadmin').required()
  });
  
  return schema.validate(admin);
}

module.exports = { adminModel, validateAdmin };
