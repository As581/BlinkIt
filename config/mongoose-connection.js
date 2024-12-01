const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to MongoDB");
  } catch (error) {
    process.exit(1);
    console.error("MongoDB connection error:", error.message);
  }
};

module.exports = connectDB;

