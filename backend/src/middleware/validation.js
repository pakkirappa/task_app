const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  campaign: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow(''),
    status: Joi.string().valid('draft', 'active', 'paused', 'completed'),
    budget: Joi.number().positive().allow(null),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().min(Joi.ref('start_date')).allow(null)
  }),

  campaignUpdate: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow(''),
    status: Joi.string().valid('draft', 'active', 'paused', 'completed'),
    budget: Joi.number().positive().allow(null),
    start_date: Joi.date().allow(null),
    end_date: Joi.date().min(Joi.ref('start_date')).allow(null)
  }),

  lead: Joi.object({
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().max(20).allow(''),
    company: Joi.string().max(100).allow(''),
    position: Joi.string().max(100).allow(''),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost'),
    source: Joi.string().valid('website', 'referral', 'social', 'email', 'phone', 'other'),
    value: Joi.number().positive().allow(null),
    notes: Joi.string().max(1000).allow(''),
    campaign_id: Joi.string().uuid().allow(null),
    assigned_to: Joi.string().uuid().allow(null)
  }),

  leadUpdate: Joi.object({
    first_name: Joi.string().min(1).max(50),
    last_name: Joi.string().min(1).max(50),
    email: Joi.string().email(),
    phone: Joi.string().max(20).allow(''),
    company: Joi.string().max(100).allow(''),
    position: Joi.string().max(100).allow(''),
    status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost'),
    source: Joi.string().valid('website', 'referral', 'social', 'email', 'phone', 'other'),
    value: Joi.number().positive().allow(null),
    notes: Joi.string().max(1000).allow(''),
    campaign_id: Joi.string().uuid().allow(null),
    assigned_to: Joi.string().uuid().allow(null)
  })
};

module.exports = {
  validateRequest,
  schemas
};
