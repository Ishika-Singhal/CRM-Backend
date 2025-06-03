
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/segment-rules', isAuthenticated, aiController.naturalLanguageToSegmentRules);

module.exports = router;