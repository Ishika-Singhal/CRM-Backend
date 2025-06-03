require('dotenv').config(); // Load environment variables from .env file
const app = require('./app'); // Import the Express application
const connectDB = require('./config/db'); // Import the database connection function

const PORT = process.env.PORT || 5000; // Define the port for the server, default to 5000

// Connect to MongoDB database
connectDB();

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
