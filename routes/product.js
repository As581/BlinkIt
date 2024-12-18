const express = require('express');
const router = express.Router();
const { productModel,validateProduct } = require('../models/products');
const { categoryModel,validateCategory } = require('../models/category');
const { cartModel,validateCart} = require('../models/cart');
const upload = require('../config/multer_config');
const cloudinary = require('../config/cloudinary');
const { validateAdmin ,userIsLoggedIn}= require('../middlewares/admin');

router.get('/',userIsLoggedIn,async(req,res)=>{
  let somethingInCart = false;
try {
  /*let resultArray = await productModel.aggregate([
    {
      $group: {
        _id: "$category",
        products: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        products: { $slice: ["$products", 10] },
      },
    },
  ]);*/
  let resultArray = await productModel.aggregate([
  {
    $group: {
      _id: "$category", // Directly use category field for grouping
      products: { $push: "$$ROOT" }, // Push all product details in an array
    },
  },
  {
    $project: {
      _id: 0, // Hide the _id field
      category: "$_id", // Rename _id to category
      products: 1, // Keep the products array
    },
  },
]);


  
  //res.send(resultArray);

  // Check if session and user exist
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).send('Unauthorized');
  }

  let cart = await cartModel.findOne({ user: req.session.passport.user });

  if (cart && cart.products && cart.products.length > 0) somethingInCart = true;

  let rnproducts = await productModel.aggregate([
    {
      $sample: { size: 3 },
    },
  ]);

  // Handle empty arrays or nulls
  if (!resultArray || resultArray.length === 0) {
    console.log('No products found.');
  }

  if (!rnproducts || rnproducts.length === 0) {
    console.log('No random products found.');
  }

 /* let originalRes = resultArray.reduce((acc, item) => {
    acc[item.category] = item.products;
    return acc;
  }, {});
  */
  let originalRes = resultArray.reduce((acc, current) => {
  acc[current.category] = current.products; // Use `category` instead of `_id` if renamed
  return acc;
}, {});
//console.log(originalRes);

  let cartCount = cart && cart.products ? cart.products.length : 0;

  res.render("index", {  products: originalRes, rnproducts, somethingInCart, cartCount });
} catch (err) {
  console.error('Error in the aggregation or database query:', err);
  res.status(500).send('Server Error');
}


});
router.get('/delete/:id',validateAdmin,async (req,res)=>{
   if(req.user.admin){
    let prods = await productModel.findOneAndDelete({_id:req.params.id});
    return res.redirect("/admin/products");
   }
    res.send("only Admin allowed");
});

/*router.post('/',async upload.single("image"),(req,res)=>{
   let {name,price,stocks,description,image,category} = req.body;
     let {error} = validateSchema({
         name,
         price,
         stocks,
         description,
         image,
         category,
     });
     res.send(error.message);
     let product = await productModel.create({
         name,
         price,
         stocks,
         description,
         image:req.file.buffer,
         category,
     });
     res.send(product);
     
});*/

/*router.post('/', upload.single("image"), async (req, res) => {
  try {
    let { name, price, stocks, description, category } = req.body;

    // Validate the input using the schema
    let { error } = validateProduct({
      name,
      price,
      stocks,
      description,
      category
    });

    // If there's a validation error, send it back
    if (error) return res.status(400).send(error.message);

    // Check if the category exists, if not create a new one
    let isCategory = await categoryModel.findOne({ name: category });
    if (!isCategory) {
      isCategory = await categoryModel.create({ name: category });
    }

    // Create the product and assign the category ID
    let product = await productModel.create({
      name,
      price,
      stocks,
      description,
      image: req.file ? req.file.buffer : null, // Handle file upload, use req.file.buffer if exists
      category,
    });

    // Send the created product as a response
    res.redirect("back");

  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});*/

/*2router.post('/', upload.single("image"), async (req, res) => {
  try {
    let { name, price, stocks, description, category } = req.body;
    let { error } = validateProduct({
      name,
      price,
      stocks,
      description,
      category
    });

    if (error) {
      req.flash('error', error.messages);
      return res.status(400).redirect("back");
    }

    let isCategory = await categoryModel.findOne({ name: category });
    if (!isCategory) {
      isCategory = await categoryModel.create({ name: category });
    }
    
    let product = await productModel.create({
      name,
      price,
      stocks,
      description,
      image: req.file ? req.file.buffer : null,
      category,
    });

    // Set success flash message
    req.flash('success', 'Product is created successfully!');
    
    // Send the created product as a response
    res.redirect("back");

  } catch (err) {
    console.log(err.message);
    req.flash('error', 'Server Error');
    res.status(500).redirect("back");
  }
});*/

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, stocks, description, category } = req.body;

    if (!name || !price || !stocks || !description || !category || !req.file) {
      req.flash('error', 'All fields, including an image, are required.');
      return res.status(400).redirect('back');
    }

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          req.flash('error', 'Image upload failed.');
          return res.status(500).redirect('back');
        }
        let isCategory = await categoryModel.findOne({ name: category });
        if (!isCategory) {
          isCategory = await categoryModel.create({ name: category });
        }

        // Create Product
        const product = await productModel.create({
          name,
          price,
          stocks,
          description,
          image: result.secure_url, // Cloudinary public URL
          category: isCategory._id,
        });

        req.flash('success', 'Product created successfully!');
        return res.redirect('back');
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error!');
    res.status(500).redirect('back');
  }
});



module.exports = router;
