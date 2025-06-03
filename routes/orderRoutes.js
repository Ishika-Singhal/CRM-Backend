
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to ingest new order data
router.post('/', isAuthenticated, validateOrder, orderController.createOrder);

// Route to get all orders
router.get('/', isAuthenticated, orderController.getOrders);

// Route to get a single order by ID
router.get('/:id', isAuthenticated, orderController.getOrderById);

// Route to update order data
router.put('/:id', isAuthenticated, validateOrder, orderController.updateOrder);

// Route to delete an order
router.delete('/:id', isAuthenticated, orderController.deleteOrder);

module.exports = router
