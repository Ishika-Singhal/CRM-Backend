const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { // Unique identifier for the customer, could be from an external system
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    sparse: true // Allows null values
  },
  address: {
    type: String,
    trim: true,
    sparse: true
  },
  totalSpend: { // Aggregated total spend by the customer
    type: Number,
    default: 0
  },
  totalVisits: { // Aggregated total visits by the customer
    type: Number,
    default: 0
  },
  lastActivity: { // Timestamp of the last activity (e.g., order, visit)
    type: Date,
    default: Date.now
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
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);