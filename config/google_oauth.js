const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { userModel } = require('../models/user');
const passport = require('passport');
const redisClient = require('./RedisConfig'); // Import Redis client
require('dotenv').config();
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Ensure spelling is correct
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const email = profile.emails[0].value;
      let user = await userModel.findOne({ email: email });

      if (!user) {
        user = new userModel({
          name: profile.displayName,
          email: email,
        });
        await user.save();
      }

      cb(null, user);
    } catch (err) {
      cb(err, false);
    }
  }
));

// Serialize user ID
passport.serializeUser(function (user, cb) {
  cb(null, user._id);
});

// Deserialize user with Redis caching
passport.deserializeUser(async function (id, cb) {
  try {
    // Check if user exists in Redis cache
    const cachedUser = await redisClient.get(`user:${id}`);
    console.log(cachedUser);

    if (cachedUser) {
      // Parse cached data and return from cache
      return cb(null, JSON.parse(cachedUser));
    } else {
      // Fetch user from database if not in cache
      const user = await userModel.findById(id);

      if (user) {
        // Store user in Redis cache for future requests
        await redisClient.set(`user:${id}`, JSON.stringify(user), { EX: 3600 }); // Cache for 1 hour
      }

      cb(null, user);
    }
  } catch (err) {
    cb(err, null);
  }
});

module.exports = passport;
