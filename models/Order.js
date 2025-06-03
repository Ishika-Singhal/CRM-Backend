const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerId: { 
    type: String,
    required: true,
    ref: 'Customer' 
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
  items: [ 
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }
  ],
  status: { 
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'shipped', 'delivered'],
    default: 'completed'
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


orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
