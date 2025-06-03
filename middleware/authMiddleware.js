const isAuthenticated = (req, res, next) => {
  // Passport populates req.user if a user is authenticated
  if (req.user) {
    next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    // User is not authenticated, send a 401 Unauthorized response
    res.status(401).json({ message: 'Unauthorized: Please log in.', success: false });
  }
};

module.exports = { isAuthenticated };
