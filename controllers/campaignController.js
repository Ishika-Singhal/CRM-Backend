
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const { simulateMessageSending } = require('../services/vendorApiSimulator'); // Import the simulator

/**
 * Helper function to apply segmentation rules and find matching customers.
 * This is a simplified implementation. In a real system, this would be highly optimized
 * and potentially run on a separate data processing engine.
 *
 * @param {Object} segmentRules - The segmentation rules object.
 * @returns {Promise<Array>} - A promise that resolves to an array of matching customer IDs.
 */
const applySegmentationRules = async (segmentRules) => {
  let query = {};

  // Recursive function to build MongoDB query from segment rules
  const buildQuery = (rules) => {
    if (!rules || !rules.operator || !rules.rules || !Array.isArray(rules.rules)) {
      console.error("Invalid segment rules structure:", rules);
      return {};
    }

    const conditions = rules.rules.map(rule => {
      if (rule.operator) { // Nested rule group
        return buildQuery(rule);
      } else { // Single rule
        const { field, condition, value } = rule;
        switch (condition) {
          case 'EQ': return { [field]: value }; // Equals
          case 'NE': return { [field]: { $ne: value } }; // Not Equals
          case 'GT': return { [field]: { $gt: value } }; // Greater Than
          case 'LT': return { [field]: { $lt: value } }; // Less Than
          case 'GTE': return { [field]: { $gte: value } }; // Greater Than or Equal To
          case 'LTE': return { [field]: { $lte: value } }; // Less Than or Equal To
          case 'CONTAINS': return { [field]: { $regex: value, $options: 'i' } }; // Case-insensitive contains
          case 'NOCONTAINS': return { [field]: { $not: new RegExp(value, 'i') } }; // Case-insensitive does not contain
          case 'INACTIVE_DAYS': // Example: inactive for 90 days
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - value);
            return { lastActivity: { $lt: dateThreshold } }; // Last activity older than threshold
          case 'ACTIVE_DAYS': // Example: active in last 30 days
            const activeDateThreshold = new Date();
            activeDateThreshold.setDate(activeDateThreshold.getDate() - value);
            return { lastActivity: { $gte: activeDateThreshold } }; // Last activity newer than threshold
          // Add more conditions as needed (e.g., 'STARTS_WITH', 'ENDS_WITH', 'BETWEEN')
          default: return {};
        }
      }
    });

    if (rules.operator === 'AND') {
      return { $and: conditions.filter(c => Object.keys(c).length > 0) };
    } else if (rules.operator === 'OR') {
      return { $or: conditions.filter(c => Object.keys(c).length > 0) };
    }
    return {};
  };

  query = buildQuery(segmentRules);
  console.log("MongoDB Query for segmentation:", JSON.stringify(query));

  try {
    // Find customers matching the constructed query
    const customers = await Customer.find(query).select('customerId email'); // Select only necessary fields
    return customers.map(c => ({ customerId: c.customerId, email: c.email }));
  } catch (error) {
    console.error('Error applying segmentation rules:', error);
    throw error;
  }
};


// Create a new campaign
const createCampaign = async (req, res, next) => {
  try {
    const { name, description, segmentRules, messageTemplate, status, scheduledAt } = req.body;
    const userId = req.user.id; // Get user ID from authenticated session

    // Validate segment rules structure (basic check, more detailed validation in Joi)
    if (!segmentRules || !segmentRules.operator || !Array.isArray(segmentRules.rules)) {
      return res.status(400).json({ message: 'Invalid segment rules format.', success: false });
    }

    // Apply segmentation rules to get audience size preview
    const audience = await applySegmentationRules(segmentRules);
    const audienceSize = audience.length;

    const newCampaign = new Campaign({
      userId,
      name,
      description,
      segmentRules,
      messageTemplate,
      audienceSize,
      status: status || 'draft', // Default to draft
      scheduledAt: status === 'scheduled' ? scheduledAt : null // Only set if status is scheduled
    });

    await newCampaign.save();

    // If campaign is scheduled or immediately sent, trigger delivery simulation
    if (newCampaign.status === 'scheduled' || newCampaign.status === 'sent') {
      // In a real scenario, this would be a background job or a scheduled task.
      // For this demo, we'll simulate immediate sending for simplicity.
      // If it's scheduled, a cron job would pick it up later.
      console.log(`Campaign "${newCampaign.name}" created. Simulating message sending...`);
      // Simulate sending messages to the audience
      await simulateMessageSending(newCampaign._id, audience, newCampaign.messageTemplate);

      // Update campaign status to 'sent' and record sentAt
      newCampaign.status = 'sent';
      newCampaign.sentAt = Date.now();
      await newCampaign.save();
    }


    res.status(201).json({
      message: 'Campaign created successfully',
      success: true,
      campaign: newCampaign
    });
  } catch (error) {
    next(error);
  }
};

// Get all campaigns (most recent on top)
const getCampaigns = async (req, res, next) => {
  try {
    // Only fetch campaigns created by the authenticated user
    const campaigns = await Campaign.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Campaigns fetched successfully',
      success: true,
      campaigns
    });
  } catch (error) {
    next(error);
  }
};

// Get a single campaign by ID
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }
    res.status(200).json({
      message: 'Campaign fetched successfully',
      success: true,
      campaign
    });
  } catch (error) {
    next(error);
  }
};

// Update a campaign
const updateCampaign = async (req, res, next) => {
  try {
    const { name, description, segmentRules, messageTemplate, status, scheduledAt } = req.body;

    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }

    // Re-calculate audience size if segment rules are updated
    let audienceSize = campaign.audienceSize;
    if (segmentRules && JSON.stringify(segmentRules) !== JSON.stringify(campaign.segmentRules)) {
      const audience = await applySegmentationRules(segmentRules);
      audienceSize = audience.length;
    }

    campaign.name = name || campaign.name;
    campaign.description = description || campaign.description;
    campaign.segmentRules = segmentRules || campaign.segmentRules;
    campaign.messageTemplate = messageTemplate || campaign.messageTemplate;
    campaign.audienceSize = audienceSize;
    campaign.status = status || campaign.status;
    campaign.scheduledAt = status === 'scheduled' ? scheduledAt : campaign.scheduledAt; // Update scheduledAt only if status is scheduled
    campaign.updatedAt = Date.now();

    await campaign.save();

    // If campaign status changes to 'sent' or 'scheduled' and it wasn't already sent, trigger simulation
    if ((campaign.status === 'sent' || campaign.status === 'scheduled') && !campaign.sentAt) {
        console.log(`Campaign "${campaign.name}" updated. Simulating message sending...`);
        const audience = await applySegmentationRules(campaign.segmentRules); // Get current audience
        await simulateMessageSending(campaign._id, audience, campaign.messageTemplate);

        // Update campaign status to 'sent' and record sentAt
        campaign.status = 'sent';
        campaign.sentAt = Date.now();
        await campaign.save();
    }

    res.status(200).json({
      message: 'Campaign updated successfully',
      success: true,
      campaign
    });
  } catch (error) {
    next(error);
  }
};

// Delete a campaign
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }

    // Also delete associated communication logs
    await CommunicationLog.deleteMany({ campaignId: req.params.id });

    res.status(200).json({ message: 'Campaign deleted successfully', success: true });
  } catch (error) {
    next(error);
  }
};

// Get audience size preview for given rules
const getAudiencePreview = async (req, res, next) => {
  try {
    const { segmentRules } = req.body;

    if (!segmentRules || !segmentRules.operator || !Array.isArray(segmentRules.rules)) {
      return res.status(400).json({ message: 'Invalid segment rules format.', success: false });
    }

    const audience = await applySegmentationRules(segmentRules);
    res.status(200).json({
      message: 'Audience preview generated successfully',
      success: true,
      audienceSize: audience.length,
      // In a real app, you might return a sample of customer IDs, not all
      sampleCustomerEmails: audience.slice(0, 5).map(c => c.email) // Return first 5 emails as sample
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getAudiencePreview,
  applySegmentationRules // Exported for potential use in AI feature or other services
};