const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: { // User who created the campaign
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Segmentation rules in a flexible JSON format
  // Example: { "operator": "AND", "rules": [ { "field": "totalSpend", "condition": "GT", "value": 10000 }, { "field": "totalVisits", "condition": "LT", "value": 3 } ] }
  // Or: { "operator": "OR", "rules": [ { "field": "lastActivity", "condition": "INACTIVE_DAYS", "value": 90 } ] }
  segmentRules: {
    type: Object, // Store as a flexible JSON object
    required: true
  },
  messageTemplate: { // The message content for the campaign
    type: String,
    required: true
  },
  audienceSize: { // Estimated audience size when the campaign was created/last updated
    type: Number,
    default: 0
  },
  deliveryStats: { // Statistics about campaign delivery
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  status: { // e.g., 'draft', 'scheduled', 'sent', 'completed'
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'completed', 'failed'],
    default: 'draft'
  },
  scheduledAt: { // When the campaign is scheduled to be sent
    type: Date,
    sparse: true // Allows null values
  },
  sentAt: { // When the campaign was actually sent
    type: Date,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` field on save
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
