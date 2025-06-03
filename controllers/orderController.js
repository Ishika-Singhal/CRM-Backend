const Order = require('../models/Order');
const Customer = require('../models/Customer'); // To update customer stats
const { updateCustomerStats } = require('./customerController'); // Import the helper

// Ingest new order data
const createOrder = async (req, res, next) => {
  try {
    const { orderId, customerId, orderDate, totalAmount, items, status } = req.body;

    // Check if order already exists
    let order = await Order.findOne({ orderId });
    if (order) {
      return res.status(409).json({ message: 'Order with this ID already exists.', success: false });
    }

    // Check if customer exists for this order
    const customerExists = await Customer.findOne({ customerId });
    if (!customerExists) {
      return res.status(404).json({ message: `Customer with ID ${customerId} not found. Cannot create order.`, success: false });
    }

    // Create new order
    const newOrder = new Order({
      orderId,
      customerId,
      orderDate,
      totalAmount,
      items,
      status
    });

    await newOrder.save();

    // Update customer's total spend and total visits
    await updateCustomerStats(customerId, totalAmount, true); // true for new order

    res.status(201).json({
      message: 'Order created successfully',
      success: true,
      order: newOrder
    });
  } catch (error) {
    next(error); // Pass error to global error handling middleware
  }
};

// Get all orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); // Sort by most recent order date
    res.status(200).json({
      message: 'Orders fetched successfully',
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order by ID
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.', success: false });
    }
    res.status(200).json({
      message: 'Order fetched successfully',
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Update order data (e.g., status)
const updateOrder = async (req, res, next) => {
  try {
    const { orderDate, totalAmount, items, status } = req.body;

    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.', success: false });
    }

    // Update fields if provided
    order.orderDate = orderDate || order.orderDate;
    order.totalAmount = totalAmount || order.totalAmount;
    order.items = items || order.items;
    order.status = status || order.status;
    order.updatedAt = Date.now();

    await order.save();
    res.status(200).json({
      message: 'Order updated successfully',
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Delete an order
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.', success: false });
    }

    // Optionally, revert customer stats if an order is deleted.
    // This can be complex if orders are frequently updated/deleted.
    // For simplicity, we'll skip reverting stats for now.
    // In a real CRM, recalculating stats periodically or using event sourcing might be better.

    res.status(200).json({ message: 'Order deleted successfully', success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};