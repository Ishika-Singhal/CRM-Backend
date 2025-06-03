const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: { 
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
 
  segmentRules: {
    type: Object,
    required: true
  },
  messageTemplate: { 
    type: String,
    required: true
  },
  audienceSize: { 
    type: Number,
    default: 0
  },
  deliveryStats: {
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  status: { 
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'completed', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date,
    sparse: true
  },
  sentAt: { 
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

campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
