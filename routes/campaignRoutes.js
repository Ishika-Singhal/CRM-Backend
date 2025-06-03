
const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { validateCampaign } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to create a new campaign
router.post('/', isAuthenticated, validateCampaign, campaignController.createCampaign);

// Route to get all campaigns (most recent on top)
router.get('/', isAuthenticated, campaignController.getCampaigns);

// Route to get a single campaign by ID
router.get('/:id', isAuthenticated, campaignController.getCampaignById);

// Route to update a campaign
router.put('/:id', isAuthenticated, validateCampaign, campaignController.updateCampaign);

// Route to delete a campaign
router.delete('/:id', isAuthenticated, campaignController.deleteCampaign);

// Route to get audience size preview for given rules
router.post('/audience-preview', isAuthenticated, campaignController.getAudiencePreview);

module.exports = router;


