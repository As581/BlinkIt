const express = require('express');
const router = express.Router();
const { cartModel,validateCart} = require('../models/cart');
const { productModel } = require('../models/products');
const {userIsLoggedIn}= require('../middlewares/admin');
const mongoose = require('mongoose');


router.get('/', userIsLoggedIn,async (req,res)=>{
  /*try {
    let cart = await cartModel
        .findOne({ user: req.session.passport.user });
    if (!cart) {
        return res.send("Cart not found");
    }

    let cartDataStructure = {};

    cart.products.forEach((product) => {
        let key = product._id.toString();
        if (cartDataStructure[key]) {
            cartDataStructure[key].quantity += 1;
        } else {
            cartDataStructure[key] = {
                ...product._doc,
                quantity: 1,
            };
        }
    });

    let finalArray = Object.values(cartDataStructure).populate("products.product");
    res.send(finalArray);
    //res.render("cart", { cart: finalArray ,Finalprice:cart.TotalPrice});
} catch (err) {
    res.send(err.message);
}
*/
/*try {
    // Fetch cart and populate products
    let cart = await cartModel
        .findOne({ user: req.session.passport.user })
        .populate("products.product");  // Populate products
     console.log(cart);
    if (!cart) {
        return res.send("Cart not found");
    }

    let cartDataStructure = {};

    // Aggregate products and quantity
    cart.products.forEach((product) => {
        let key = product.product._id.toString();  // Correctly access product ID
        if (cartDataStructure[key]) {
            cartDataStructure[key].quantity += 1;
        } else {
            cartDataStructure[key] = {
                ...product.product._doc,  // Access the populated product details
                quantity: 1,
            };
        }
    });

    let finalArray = Object.values(cartDataStructure);  // Convert to array

    //res.send(finalArray);
     res.render("cart", { cart: finalArray, Finalprice: cart.TotalPrice });
} catch (err) {
    console.log(err.message);
}
*/
try {
    // Fetch cart and populate products
    let cart = await cartModel
        .findOne({ user: req.session.passport.user })
        .populate("products.product");  // Populate products

    if (!cart) {
        return res.send("Cart not found");
    }

    let cartDataStructure = {};

    // Aggregate products and quantity
    cart.products.forEach((product) => {
        let key = product.product._id.toString();  // Correctly access product ID
        if (cartDataStructure[key]) {
            cartDataStructure[key].quantity += product.quantity; // Ensure correct quantity aggregation
        } else {
            cartDataStructure[key] = {
                ...product.product.toObject(),  // Convert to plain object
                quantity: product.quantity,     // Ensure quantity is properly passed from cart
            };
        }
    });

    let finalArray = Object.values(cartDataStructure);  
    //let cartCount = cart && cart.products ? cart.products.length : 0;

    res.render('cart', { cart: finalArray ,Finalprice: cart.TotalPrice,cartCount:cart.products.length});
} catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).send('Internal server error: ' + err.message);
}

});
router.get('/add/:id', userIsLoggedIn,async (req,res)=>{
    /*try{
         let cart = await cartModel.findOne({user:req.session.passport.user});
         let product = await productModel.findOne({_id:req.params.id});
         if(!cart){
       cart = await cartModel.create({
        user:req.session.passport.user,
           products:[req.params.id],
       TotalPrice:Number(product.price),
       });
         }else{
            cart.products.push(req.params.id);
 cart.TotalPrice = Number(cart.TotalPrice) + Number(product.price);
            await cart.save();
         }
         res.redirect("back");
     }catch(err){
         res.send(err.message);
     }
     */
     
     try {
    let cart = await cartModel.findOne({ user: req.session.passport.user });
    let product = await productModel.findOne({ _id: req.params.id });

    if (!product) {
        return res.status(404).send("Product not found");
    }

    if (!cart) {
        // Create a new cart if not found
        cart = await cartModel.create({
            user: req.session.passport.user,
            products: [{ product: req.params.id, quantity: 1 }], // Correct format for product with quantity
            TotalPrice:Number(product.price),
        });
        console.log("New Cart Created:", cart);
    } else {
        if (!cart.products) {
            cart.products = [];
        }

        // Check if product already exists in cart
        const existingProduct = cart.products.find(item => item.product == req.params.id);
        if (existingProduct) {
            // Increment quantity if product already in cart
            existingProduct.quantity += 1;
        } else {
            // Add new product to cart
            cart.products.push({ product: req.params.id, quantity: 1 });
        }
      cart.TotalPrice =Number(cart.TotalPrice) + Number(product.price);
        await cart.save();
        console.log("Product Added to Existing Cart:", cart);
    }

    res.redirect("/cart");
} catch (err) {
    console.log("Error:", err);
    res.status(500).send(err.message);
}

});

router.get('/remove/:id', userIsLoggedIn, async (req, res) => {
    try {
        let cart = await cartModel.findOne({ user: req.session.passport.user });
        let product = await productModel.findOne({ _id: req.params.id });

        if (!product) {
            return res.status(404).send("Product not found");
        }

        if (!cart) {
            return res.status(400).send("Cart not found");
        }

        // Ensure cart.products is initialized properly
        if (!cart.products || cart.products.length === 0) {
            return res.status(400).send("No products in cart to remove");
        }

        // Find the product in the cart
        const productIndex = cart.products.findIndex(item => item.product == req.params.id);

        if (productIndex === -1) {
            return res.status(400).send("Product not in cart");
        }

        const productInCart = cart.products[productIndex];

        if (productInCart.quantity > 1) {
            // Decrease quantity if more than 1
            productInCart.quantity -= 1;
        } else {
            // Remove product from cart if only 1 remains
            cart.products.splice(productIndex, 1);
        }

        // Update the total price
        cart.TotalPrice = Number(cart.TotalPrice) - Number(product.price);

        // Save the updated cart
        await cart.save();
        console.log("Product Removed from Cart:", cart);

        res.redirect("/cart"); // Redirect to the cart page after removing
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send(err.message);
    }
});



router.get('/remove/:id', userIsLoggedIn,async (req,res)=>{
  /*try{
      let cart =  await cartModel.findOne({user:req.session.passport.user});
    if(!cart) return res.send("something went wrong while removing item");
    let index = cart.products.indexOf(req.params.id);
    if(index !== -1) cart.products.splice(index,1);
      await cart.save();
      res.redirect("/products");
    }catch(err){
        res.send(err.message);
    }
    */
    
try {
    let cart = await cartModel.findOne({ user: req.session.passport.user });
    if (!cart) return res.send("something went wrong while removing item");
    let index = cart.products.findIndex(item => item.product.toString() === req.params.id);
    if (index !== -1) {
        cart.products.splice(index, 1);
        await cart.save();  
    } else {
        return res.send("Product not found in cart");
    }

    res.redirect("/products");
} catch (err) {
    res.send(err.message);
}


});


module.exports = router;
