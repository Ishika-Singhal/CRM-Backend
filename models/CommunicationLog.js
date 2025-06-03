const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  customerId: { 
    type: String, 
    required: true
  },
  messageContent: {
    type: String,
    required: true
  },
  deliveryStatus: { 
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  },
  vendorMessageId: { 
    type: String,
    sparse: true
  },
  deliveryAttemptedAt: {
    type: Date,
    default: Date.now
  },
  deliveryUpdatedAt: { 
    type: Date,
    sparse: true
  },
  failureReason: { 
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

communicationLogSchema.index({ campaignId: 1, customerId: 1 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);