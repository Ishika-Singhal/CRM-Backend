
const Joi = require('joi');

// Joi schema for validating customer data ingestion
const customerSchema = Joi.object({
  customerId: Joi.string().required().trim(),
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().trim().allow(null, ''),
  address: Joi.string().trim().allow(null, '')
});

// Joi schema for validating order data ingestion
const orderSchema = Joi.object({
  orderId: Joi.string().required().trim(),
  customerId: Joi.string().required().trim(),
  orderDate: Joi.date().iso().required(), // ISO 8601 date string
  totalAmount: Joi.number().min(0).required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required()
  })).required(),
  status: Joi.string().valid('pending', 'completed', 'cancelled', 'shipped', 'delivered').default('completed')
});

// Joi schema for validating campaign creation/update
const campaignSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim().allow(null, ''),
  segmentRules: Joi.object().required(), // Detailed validation of segmentRules can be added here
  messageTemplate: Joi.string().required().trim(),
  status: Joi.string().valid('draft', 'scheduled', 'sent', 'completed', 'failed').default('draft'),
  scheduledAt: Joi.date().iso().allow(null)
});

// Joi schema for validating delivery receipt updates
const deliveryReceiptSchema = Joi.object({
  vendorMessageId: Joi.string().required(),
  status: Joi.string().valid('sent', 'failed', 'delivered').required(), // Status from vendor API
  failureReason: Joi.string().allow(null, '')
});


// Generic validation middleware function
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false to get all errors

  if (error) {
    // Map validation errors to a more readable format
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      message: 'Validation failed',
      success: false,
      errors: errors
    });
  }
  next(); // If validation passes, proceed to the next middleware
};

module.exports = {
  validateCustomer: validate(customerSchema),
  validateOrder: validate(orderSchema),
  validateCampaign: validate(campaignSchema),
  validateDeliveryReceipt: validate(deliveryReceiptSchema)
};
