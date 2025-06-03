
const express = require('express');
const cors = require('cors');
const session = require('express-session'); // Changed from cookie-session to express-session
const passport = require('passport');
const path = require('path'); // Import path module

// Import database connection and passport config (for Google OAuth)
require('./config/db');
require('./config/passport'); // This file will contain Google OAuth setup

const app = express();

// Middleware
// Enable CORS for all routes, allowing requests from different origins
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // This line is crucial
  credentials: true
}))

// Setup express-session middleware for managing sessions
// This replaces cookie-session for better compatibility with Passport.js's session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_very_secret_key_for_session', // A strong, random string for session encryption
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something is stored
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    sameSite: 'lax' // Protects against CSRF attacks
  }
}));


// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory (if any)
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const communicationLogRoutes = require('./routes/communicationLogRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Use routes
app.use('/auth', authRoutes); // Authentication routes
app.use('/api/customers', customerRoutes); // Customer data ingestion routes
app.use('/api/orders', orderRoutes); // Order data ingestion routes
app.use('/api/campaigns', campaignRoutes); // Campaign management routes
app.use('/api/communication-logs', communicationLogRoutes); // Communication log routes
app.use('/api/ai', aiRoutes); // AI-powered features routes

// Basic route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Mini CRM Backend API!');
});

// Global error handling middleware
// This middleware catches any errors thrown in the application and sends a standardized error response.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong!',
    success: false,
    error: process.env.NODE_ENV === 'development' ? err : {} // Send full error in dev, empty in prod
  });
});

module.exports = app; // Export the configured Express app
