const express = require('express');
const router = express.Router();
const { adminModel } = require('../models/admin');
const { productModel } = require('../models/products');
const { categoryModel } = require('../models/category');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateAdmin }= require('../middlewares/admin');

// Route to create an admin
router.get('/create',(req,res)=>{
     res.render("adminRegister");
});
router.post('/create', async (req, res) => {
  try {
       console.log("Request Body",req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).send("All fields are required");
    }

    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send("Admin with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const admin = new adminModel({
      name,
      email,
      password: hash,
      role,
    });

    await admin.save();

    const token = jwt.sign(
      { email: admin.email, admin: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("token", token);
    res.send("Admin created successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// Render login page
router.get('/login', (req, res) => {
  res.render("admin_login");
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).send("Admin not found");
    }

    let validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).send("Invalid credentials");
    }

    let token = jwt.sign({ email: admin.email, admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Admin dashboard route
router.get('/dashboard', validateAdmin, async (req, res) => {
   let products =  await productModel.find();
   let category = await categoryModel.find();
  res.render("admin_dashboard",{ products:products.length,category:category.length});
});

// Logout route
router.get('/logout', validateAdmin, (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
});

// Products route
router.get('/products', validateAdmin, async (req, res) => {
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
    ]);
    */
let resultArray = await productModel.aggregate([
  {
    $group: {
      _id: "$category", // Products ko category ke hisaab se group karna
      products: { $push: "$$ROOT" } // Saare product documents ko products array mein push karna
    }
  },
  {
    $project: {
      _id: 0, // _id ko hide karna (optional)
      category: "$_id", // _id ko category ke naam se rename karna
      products: 1 // products array ko retain karna
    }
  }
]);
    let originalRes = resultArray.reduce((acc, item) => {
      acc[item.category] = item.products;
      return acc;
    }, {});

    res.render("adminSearch", { products: originalRes});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*router.get('/products/search', validateAdmin, async (req, res) => {
  const productId = req.query.product_id;
    try {
        const product = await productModel.findById(productId); 
        
        if (product) {
            // Send searched product along with the other products data
            res.render('admin-products', { searchResult: product, products: {}, found: true });
        } else {
            // If no product is found
            res.render('admin-products', { searchResult: null, products: {}, found: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
  
    


    
});
*/
router.get('/products/search', validateAdmin, async (req, res) => {
    const productId = req.query.product_id;
    try {
        const product = await productModel.findById(productId); 
        
        if (product) {
            // Convert image buffer to base64 if image exists
            const imageBase64 = product.image ? product.image.toString('base64') : null;

            res.status(200).json({
                success: true,
                product: {
                    ...product._doc,
                    image: imageBase64, // Send the base64-encoded image
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'No product found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
