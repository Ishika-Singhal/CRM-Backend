
const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const { simulateMessageSending } = require('../services/vendorApiSimulator');
const applySegmentationRules = async (segmentRules) => {
  let query = {};

  
  const buildQuery = (rules) => {
    if (!rules || !rules.operator || !rules.rules || !Array.isArray(rules.rules)) {
      console.error("Invalid segment rules structure:", rules);
      return {};
    }

    const conditions = rules.rules.map(rule => {
      if (rule.operator) { 
        return buildQuery(rule);
      } else {
        const { field, condition, value } = rule;
        switch (condition) {
          case 'EQ': return { [field]: value }; 
          case 'NE': return { [field]: { $ne: value } }; 
          case 'GT': return { [field]: { $gt: value } }; 
          case 'LT': return { [field]: { $lt: value } }; 
          case 'GTE': return { [field]: { $gte: value } }; 
          case 'LTE': return { [field]: { $lte: value } }; 
          case 'CONTAINS': return { [field]: { $regex: value, $options: 'i' } }; 
          case 'NOCONTAINS': return { [field]: { $not: new RegExp(value, 'i') } }; 
          case 'INACTIVE_DAYS':
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - value);
            return { lastActivity: { $lt: dateThreshold } };
          case 'ACTIVE_DAYS':
            const activeDateThreshold = new Date();
            activeDateThreshold.setDate(activeDateThreshold.getDate() - value);
            return { lastActivity: { $gte: activeDateThreshold } }; 
          
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
   
    const customers = await Customer.find(query).select('customerId email'); 
    return customers.map(c => ({ customerId: c.customerId, email: c.email }));
  } catch (error) {
    console.error('Error applying segmentation rules:', error);
    throw error;
  }
};



const createCampaign = async (req, res, next) => {
  try {
    const { name, description, segmentRules, messageTemplate, status, scheduledAt } = req.body;
    const userId = req.user.id;

    
    if (!segmentRules || !segmentRules.operator || !Array.isArray(segmentRules.rules)) {
      return res.status(400).json({ message: 'Invalid segment rules format.', success: false });
    }

    
    const audience = await applySegmentationRules(segmentRules);
    const audienceSize = audience.length;

    const newCampaign = new Campaign({
      userId,
      name,
      description,
      segmentRules,
      messageTemplate,
      audienceSize,
      status: status || 'draft', 
      scheduledAt: status === 'scheduled' ? scheduledAt : null
    });

    await newCampaign.save();

    if (newCampaign.status === 'scheduled' || newCampaign.status === 'sent') {

      console.log(`Campaign "${newCampaign.name}" created. Simulating message sending...`);
      await simulateMessageSending(newCampaign._id, audience, newCampaign.messageTemplate);

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

const getCampaigns = async (req, res, next) => {
  try {
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

const updateCampaign = async (req, res, next) => {
  try {
    const { name, description, segmentRules, messageTemplate, status, scheduledAt } = req.body;

    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }

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
    campaign.scheduledAt = status === 'scheduled' ? scheduledAt : campaign.scheduledAt; 
    campaign.updatedAt = Date.now();

    await campaign.save();

    if ((campaign.status === 'sent' || campaign.status === 'scheduled') && !campaign.sentAt) {
        console.log(`Campaign "${campaign.name}" updated. Simulating message sending...`);
        const audience = await applySegmentationRules(campaign.segmentRules); 
        await simulateMessageSending(campaign._id, audience, campaign.messageTemplate);

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

const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }

    await CommunicationLog.deleteMany({ campaignId: req.params.id });

    res.status(200).json({ message: 'Campaign deleted successfully', success: true });
  } catch (error) {
    next(error);
  }
};


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
      sampleCustomerEmails: audience.slice(0, 5).map(c => c.email) 
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
  applySegmentationRules 
};