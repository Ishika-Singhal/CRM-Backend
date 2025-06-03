// backend/routes/communicationLogRoutes.js
// Defines API routes for communication logs and delivery receipts.

const express = require('express');
const router = express.Router();
const communicationLogController = require('../controllers/communicationLogController.js');
const { validateDeliveryReceipt } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route for dummy Vendor API to send delivery receipts
// This route does not require authentication as it's called by an external system (dummy vendor)
router.post('/delivery-receipt', validateDeliveryReceipt, communicationLogController.handleDeliveryReceipt);

// Route to get all communication logs for a specific campaign
router.get('/campaign/:campaignId', isAuthenticated, communicationLogController.getCommunicationLogsForCampaign);

module.exports = router;
