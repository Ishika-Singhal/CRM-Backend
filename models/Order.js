const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { // Unique identifier for the order
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerId: { // Reference to the Customer who placed the order
    type: String,
    required: true,
    ref: 'Customer' // This is a virtual reference, actual foreign key is `customerId` string
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  items: [ // Array of items in the order
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }
  ],
  status: { // e.g., 'pending', 'completed', 'cancelled'
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'shipped', 'delivered'],
    default: 'completed' // Assuming most ingested orders are completed
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
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
