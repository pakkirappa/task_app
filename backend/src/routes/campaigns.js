const express = require('express');
const Campaign = require('../models/Campaign');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all campaigns
router.get('/', asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    limit: req.query.limit,
    offset: req.query.offset
  };

  const campaigns = await Campaign.list(filters, req.user.id);

  res.json({
    success: true,
    data: campaigns,
    meta: {
      total: campaigns.length,
      limit: parseInt(filters.limit) || 50,
      offset: parseInt(filters.offset) || 0
    }
  });
}));

// Get campaign by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check if user owns the campaign
  if (campaign.created_by !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Get campaign statistics
  const stats = await Campaign.getStats(campaign.id);

  res.json({
    success: true,
    data: {
      ...campaign,
      stats
    }
  });
}));

// Create campaign
router.post('/', validateRequest(schemas.campaign), asyncHandler(async (req, res) => {
  const campaignData = {
    ...req.body,
    created_by: req.user.id
  };

  const campaign = await Campaign.create(campaignData);

  logger.info(`Campaign created: ${campaign.name} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully',
    data: campaign
  });
}));

// Update campaign
router.put('/:id', validateRequest(schemas.campaignUpdate), asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check if user owns the campaign
  if (campaign.created_by !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updatedCampaign = await Campaign.update(req.params.id, req.body);

  logger.info(`Campaign updated: ${updatedCampaign.name} by user ${req.user.id}`);

  res.json({
    success: true,
    message: 'Campaign updated successfully',
    data: updatedCampaign
  });
}));

// Delete campaign
router.delete('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check if user owns the campaign
  if (campaign.created_by !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await Campaign.delete(req.params.id);

  logger.info(`Campaign deleted: ${campaign.name} by user ${req.user.id}`);

  res.json({
    success: true,
    message: 'Campaign deleted successfully'
  });
}));

// Get campaign statistics
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check if user owns the campaign
  if (campaign.created_by !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const stats = await Campaign.getStats(req.params.id);

  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;
