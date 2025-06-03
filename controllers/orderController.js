const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { updateCustomerStats } = require('./customerController'); 
const createOrder = async (req, res, next) => {
  try {
    const { orderId, customerId, orderDate, totalAmount, items, status } = req.body;

 
    let order = await Order.findOne({ orderId });
    if (order) {
      return res.status(409).json({ message: 'Order with this ID already exists.', success: false });
    }

    
    const customerExists = await Customer.findOne({ customerId });
    if (!customerExists) {
      return res.status(404).json({ message: `Customer with ID ${customerId} not found. Cannot create order.`, success: false });
    }


    const newOrder = new Order({
      orderId,
      customerId,
      orderDate,
      totalAmount,
      items,
      status
    });

    await newOrder.save();

    await updateCustomerStats(customerId, totalAmount, true);

    res.status(201).json({
      message: 'Order created successfully',
      success: true,
      order: newOrder
    });
  } catch (error) {
    next(error); 
  }
};


const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 }); 
    res.status(200).json({
      message: 'Orders fetched successfully',
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

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

const updateOrder = async (req, res, next) => {
  try {
    const { orderDate, totalAmount, items, status } = req.body;

    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.', success: false });
    }
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

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.', success: false });
    }

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