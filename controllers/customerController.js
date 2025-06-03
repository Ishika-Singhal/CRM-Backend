const Customer = require('../models/Customer');
const Order = require('../models/Order'); // Needed to update customer stats based on orders

// Ingest new customer data
const createCustomer = async (req, res, next) => {
  try {
    const { customerId, name, email, phone, address } = req.body;

    // Check if customer already exists
    let customer = await Customer.findOne({ customerId });
    if (customer) {
      return res.status(409).json({ message: 'Customer with this ID already exists.', success: false });
    }

    // Check if customer with this email already exists
    customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(409).json({ message: 'Customer with this email already exists.', success: false });
    }

    // Create new customer
    const newCustomer = new Customer({
      customerId,
      name,
      email,
      phone,
      address,
      lastActivity: Date.now() // Set initial last activity
    });

    await newCustomer.save();
    res.status(201).json({
      message: 'Customer created successfully',
      success: true,
      customer: newCustomer
    });
  } catch (error) {
    next(error); // Pass error to global error handling middleware
  }
};

// Get all customers
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json({
      message: 'Customers fetched successfully',
      success: true,
      customers
    });
  } catch (error) {
    next(error);
  }
};

// Get a single customer by ID
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.', success: false });
    }
    res.status(200).json({
      message: 'Customer fetched successfully',
      success: true,
      customer
    });
  } catch (error) {
    next(error);
  }
};

// Update customer data
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const customer = await Customer.findOne({ customerId: req.params.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.', success: false });
    }

    // Check if new email already exists for another customer
    if (email && email !== customer.email) {
      const existingEmailCustomer = await Customer.findOne({ email });
      if (existingEmailCustomer && existingEmailCustomer.customerId !== customer.customerId) {
        return res.status(409).json({ message: 'Another customer with this email already exists.', success: false });
      }
    }

    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.updatedAt = Date.now(); // Manually update timestamp

    await customer.save();
    res.status(200).json({
      message: 'Customer updated successfully',
      success: true,
      customer
    });
  } catch (error) {
    next(error);
  }
};

// Delete a customer
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndDelete({ customerId: req.params.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.', success: false });
    }
    // Optionally, also delete related orders and communication logs for this customer
    await Order.deleteMany({ customerId: req.params.id });
    // Note: Communication logs are linked by customerId string, not ObjectId, so direct deletion is fine.
    // However, if CommunicationLog also had a ref to Customer's _id, you'd need to adjust.
    // For now, we'll assume customerId string is enough.
    // await CommunicationLog.deleteMany({ customerId: req.params.id });

    res.status(200).json({ message: 'Customer deleted successfully', success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update customer's total spend and total visits.
 * This is called internally by orderController after an order is processed.
 * @param {string} customerId - The ID of the customer.
 * @param {number} amount - The amount to add to total spend.
 * @param {boolean} isNewOrder - True if this is a new order, increments total visits.
 */
const updateCustomerStats = async (customerId, amount, isNewOrder = true) => {
  try {
    const customer = await Customer.findOne({ customerId });
    if (customer) {
      customer.totalSpend = (customer.totalSpend || 0) + amount;
      if (isNewOrder) {
        customer.totalVisits = (customer.totalVisits || 0) + 1;
      }
      customer.lastActivity = Date.now();
      await customer.save();
      console.log(`Customer ${customerId} stats updated.`);
    } else {
      console.warn(`Customer with ID ${customerId} not found for stats update.`);
    }
  } catch (error) {
    console.error(`Error updating customer stats for ${customerId}:`, error);
  }
};


module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerStats
};
