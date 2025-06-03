const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  campaignId: { // Reference to the campaign this communication belongs to
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  customerId: { // Reference to the customer this message was sent to
    type: String, // Storing customerId as a string for direct lookup
    required: true
  },
  messageContent: { // The actual message sent
    type: String,
    required: true
  },
  deliveryStatus: { // 'pending', 'sent', 'failed', 'delivered'
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  },
  vendorMessageId: { // ID provided by the dummy vendor API for tracking
    type: String,
    sparse: true // Allows null values
  },
  deliveryAttemptedAt: { // Timestamp when the message was attempted to be sent
    type: Date,
    default: Date.now
  },
  deliveryUpdatedAt: { // Timestamp when the delivery status was last updated
    type: Date,
    sparse: true
  },
  failureReason: { // Reason for failure, if applicable
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups by campaign and customer
communicationLogSchema.index({ campaignId: 1, customerId: 1 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);