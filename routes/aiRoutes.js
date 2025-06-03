
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to convert natural language query to segment rules using AI
router.post('/segment-rules', isAuthenticated, aiController.naturalLanguageToSegmentRules);

module.exports = router;