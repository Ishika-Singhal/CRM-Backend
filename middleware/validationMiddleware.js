
const Joi = require('joi');

const customerSchema = Joi.object({
  customerId: Joi.string().required().trim(),
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().trim().allow(null, ''),
  address: Joi.string().trim().allow(null, '')
});

const orderSchema = Joi.object({
  orderId: Joi.string().required().trim(),
  customerId: Joi.string().required().trim(),
  orderDate: Joi.date().iso().required(), 
  totalAmount: Joi.number().min(0).required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required()
  })).required(),
  status: Joi.string().valid('pending', 'completed', 'cancelled', 'shipped', 'delivered').default('completed')
});


const campaignSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().trim().allow(null, ''),
  segmentRules: Joi.object().required(),
  messageTemplate: Joi.string().required().trim(),
  status: Joi.string().valid('draft', 'scheduled', 'sent', 'completed', 'failed').default('draft'),
  scheduledAt: Joi.date().iso().allow(null)
});

const deliveryReceiptSchema = Joi.object({
  vendorMessageId: Joi.string().required(),
  status: Joi.string().valid('sent', 'failed', 'delivered').required(),
  failureReason: Joi.string().allow(null, '')
});



const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); 

  if (error) {

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
  next(); 
};

module.exports = {
  validateCustomer: validate(customerSchema),
  validateOrder: validate(orderSchema),
  validateCampaign: validate(campaignSchema),
  validateDeliveryReceipt: validate(deliveryReceiptSchema)
};
