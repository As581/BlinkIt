const jwt = require('jsonwebtoken');

async function validateAdmin(req, res, next) {
  try {
    // Retrieve token from cookies
    let token = req.cookies.token;

    // Check if token is not present
    if (!token) {
      return res.status(401).send("Please login first"); // Or you can redirect to login page
    }

    // Verify token and decode it
    let data = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = data; // Attach the decoded token data (like email) to req.user

    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.log("Error during token verification:", err.message); // Log the error
    res.status(403).send("Invalid or expired token"); // Send more specific error message
  }
}

async function userIsLoggedIn(req,res,next){
      if(req.isAuthenticated()) return next();
      res.redirect("/users/login");
}

module.exports = {validateAdmin,userIsLoggedIn};
