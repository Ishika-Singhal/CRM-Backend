const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');


router.get('/google', authController.googleAuth);

router.get('/google/callback', authController.googleAuthCallback);


router.get('/logout', isAuthenticated, authController.logout);


router.get('/current_user', authController.getCurrentUser);

module.exports = router;
