
const passport = require('passport');


const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'] 
});


const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: process.env.FRONTEND_URL + '/login-failed', 
  successRedirect: process.env.FRONTEND_URL + '/dashboard'
});


const logout = (req, res, next) => {
  
  req.logout((err) => {
    if (err) {
    
      console.error("Error during Passport's req.logout:", err);
    }

    req.session = null;

    
    res.status(200).json({ message: 'Logged out successfully', success: true });
  });
};

const getCurrentUser = (req, res) => {
 
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

