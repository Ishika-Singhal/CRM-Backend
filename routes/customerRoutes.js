
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { validateCustomer } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Route to ingest new customer data
router.post('/', isAuthenticated, validateCustomer, customerController.createCustomer);

// Route to get all customers
router.get('/', isAuthenticated, customerController.getCustomers);

// Route to get a single customer by ID
router.get('/:id', isAuthenticated, customerController.getCustomerById);

// Route to update customer data
router.put('/:id', isAuthenticated, validateCustomer, customerController.updateCustomer);

// Route to delete a customer
router.delete('/:id', isAuthenticated, customerController.deleteCustomer);

module.exports = router;

