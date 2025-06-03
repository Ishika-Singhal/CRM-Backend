const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`); // Log successful connection
  } catch (error) {
    console.error(`Error: ${error.message}`); // Log any connection errors
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectDB;