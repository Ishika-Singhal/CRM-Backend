
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

const handleDeliveryReceipt = async (req, res, next) => {
  try {
    const { vendorMessageId, status, failureReason } = req.body;

    const logEntry = await CommunicationLog.findOne({ vendorMessageId });

    if (!logEntry) {
      return res.status(404).json({ message: 'Communication log entry not found for this vendor message ID.', success: false });
    }

    logEntry.deliveryStatus = status;
    logEntry.deliveryUpdatedAt = Date.now();
    if (failureReason) {
      logEntry.failureReason = failureReason;
    }

    await logEntry.save();

    const campaign = await Campaign.findById(logEntry.campaignId);
    if (campaign) {
      if (logEntry.deliveryStatus === 'sent' || logEntry.deliveryStatus === 'delivered') {
        campaign.deliveryStats.sent = (campaign.deliveryStats.sent || 0) + 1;
        campaign.deliveryStats.pending = Math.max(0, (campaign.deliveryStats.pending || 0) - 1);
      } else if (logEntry.deliveryStatus === 'failed') {
        campaign.deliveryStats.failed = (campaign.deliveryStats.failed || 0) + 1;
        campaign.deliveryStats.pending = Math.max(0, (campaign.deliveryStats.pending || 0) - 1);
      }
      await campaign.save();
    }

    res.status(200).json({
      message: 'Delivery receipt processed successfully',
      success: true,
      logEntry
    });
  } catch (error) {
    console.error('Error handling delivery receipt:', error);
    next(error);
  }
};
const getCommunicationLogsForCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findOne({ _id: campaignId, userId: req.user.id });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found or you do not have access.', success: false });
    }

    const logs = await CommunicationLog.find({ campaignId }).sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Communication logs fetched successfully',
      success: true,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleDeliveryReceipt,
  getCommunicationLogsForCampaign
};
