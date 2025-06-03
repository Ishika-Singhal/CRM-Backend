const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Google OAuth login route
// Redirects to Google's authentication page
router.get('/google', authController.googleAuth);

// Google OAuth callback route
// Google redirects back to this URL after authentication
router.get('/google/callback', authController.googleAuthCallback);

// Logout route
router.get('/logout', isAuthenticated, authController.logout);

// Get current authenticated user details
router.get('/current_user', authController.getCurrentUser);

module.exports = router;
