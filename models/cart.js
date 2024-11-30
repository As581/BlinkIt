const mongoose = require('mongoose');
const Joi = require('joi');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    products: [
        {
            product: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'products', 
                required: true ,
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    TotalPrice: {
        type: Number,
        required: true,
        min: 0,
    }
});

function validateCart(cart) {
  const schema = Joi.object({
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().required(), // Product ID as string
        quantity: Joi.number().min(1).default(1) // Optional: validate quantity if needed
      })
    ).required(),
    TotalPrice: Joi.number().required().min(0),
  });

  return schema.validate(cart);
}

module.exports = {
  cartModel: mongoose.model('cart', cartSchema),
  validateCart
};
