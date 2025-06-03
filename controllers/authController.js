// backend/controllers/authController.js
// Handles authentication related logic.

const passport = require('passport');

// Initiate Google OAuth login
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'] // Request access to user's profile and email
});

// Google OAuth callback handler
const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: process.env.FRONTEND_URL + '/login-failed', // Redirect on failure
  successRedirect: process.env.FRONTEND_URL + '/dashboard' // Redirect on success
});

// Logout user
const logout = (req, res, next) => {
  // When using `cookie-session`, `req.logout()` might internally try to call `req.session.regenerate()`,
  // which is not supported by `cookie-session`.
  // The correct way to "log out" with `cookie-session` is to explicitly clear `req.session`.
  // We still call `req.logout()` to ensure Passport's internal state (like `req.user`) is cleared.

  // Clear Passport's internal user state. This is an asynchronous operation.
  req.logout((err) => {
    if (err) {
      // Log any error during Passport's internal logout, but proceed to clear the session.
      // This error often indicates the `regenerate` issue, which we handle by clearing `req.session = null`.
      console.error("Error during Passport's req.logout:", err);
    }

    // Explicitly clear the cookie-session data. This is the crucial step for `cookie-session`.
    // Setting req.session to null effectively removes the session cookie from the client.
    req.session = null;

    // Send success response
    res.status(200).json({ message: 'Logged out successfully', success: true });
  });
};

// Get current authenticated user
const getCurrentUser = (req, res) => {
  // req.user is populated by Passport if a user is authenticated
  if (req.user) {
    res.status(200).json({
      user: req.user,
      isAuthenticated: true,
      success: true
    });
  } else {
    res.status(200).json({
      user: null,
      isAuthenticated: false,
      success: true
    });
  }
};

module.exports = {
  googleAuth,
  googleAuthCallback,
  logout,
  getCurrentUser
};

