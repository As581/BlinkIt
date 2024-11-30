const express = require('express');
const Router = express.Router();
const passport = require('passport');
const redisClient = require('../config/RedisConfig'); // Import Redis client

// Google Authentication route
Router.get('/google', passport.authenticate("google", {
   scope: ["profile", "email"]
}));

// Google Authentication callback route
Router.get('/google/callback', passport.authenticate("google", {
   successRedirect: "/products",
   failureRedirect: "/",
}));

// Logout route with Redis cache clearing
Router.get('/logout', async function(req, res, next) {
  try {
    if (req.user) {
      // Clear the user's Redis cache on logout
      await redisClient.del(`user:${req.user._id}`);
    }

    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
});

module.exports = Router;
