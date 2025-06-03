
const express = require('express');
const router = express.Router();
const communicationLogController = require('../controllers/communicationLogController.js');
const { validateDeliveryReceipt } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');


router.post('/delivery-receipt', validateDeliveryReceipt, communicationLogController.handleDeliveryReceipt);

// Route to get all communication logs for a specific campaign
router.get('/campaign/:campaignId', isAuthenticated, communicationLogController.getCommunicationLogsForCampaign);

module.exports = router;
