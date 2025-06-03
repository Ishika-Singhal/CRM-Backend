const isAuthenticated = (req, res, next) => {

  if (req.user) {
    next(); 
  } else {
    
    res.status(401).json({ message: 'Unauthorized: Please log in.', success: false });
  }
};

module.exports = { isAuthenticated };
