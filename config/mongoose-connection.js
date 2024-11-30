const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://av0232016:6CUKKHITgEOatspJ@blink.jacpt.mongodb.net/?retryWrites=true&w=majority&appName=Blink', {
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

