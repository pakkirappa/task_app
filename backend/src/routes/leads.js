const express = require('express');
const csv = require('csv-writer');
const path = require('path');
const fs = require('fs');
const Lead = require('../models/Lead');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all leads
router.get('/', asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    source: req.query.source,
    campaign_id: req.query.campaign_id,
    assigned_to: req.query.assigned_to,
    search: req.query.search,
    limit: req.query.limit,
    offset: req.query.offset
  };

  const leads = await Lead.list(filters);

  res.json({
    success: true,
    data: leads,
    meta: {
      total: leads.length,
      limit: parseInt(filters.limit) || 50,
      offset: parseInt(filters.offset) || 0
    }
  });
}));

// Get lead by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found'
    });
  }

  res.json({
    success: true,
    data: lead
  });
}));

// Create lead
router.post('/', validateRequest(schemas.lead), asyncHandler(async (req, res) => {
  const leadData = {
    ...req.body,
    assigned_to: req.body.assigned_to || req.user.id // Assign to current user if not specified
  };

  const lead = await Lead.create(leadData);

  logger.info(`Lead created: ${lead.email} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Lead created successfully',
    data: lead
  });
}));

// Update lead
router.put('/:id', validateRequest(schemas.leadUpdate), asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found'
    });
  }

  const updatedLead = await Lead.update(req.params.id, req.body);

  logger.info(`Lead updated: ${updatedLead.email} by user ${req.user.id}`);

  res.json({
    success: true,
    message: 'Lead updated successfully',
    data: updatedLead
  });
}));

// Delete lead
router.delete('/:id', asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found'
    });
  }

  await Lead.delete(req.params.id);

  logger.info(`Lead deleted: ${lead.email} by user ${req.user.id}`);

  res.json({
    success: true,
    message: 'Lead deleted successfully'
  });
}));

// Get lead statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const stats = await Lead.getStats();
  const statsBySource = await Lead.getStatsBySource();
  const statsByStatus = await Lead.getStatsByStatus();

  res.json({
    success: true,
    data: {
      overview: stats,
      by_source: statsBySource,
      by_status: statsByStatus
    }
  });
}));

// Export leads to CSV
router.get('/export/csv', asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    source: req.query.source,
    campaign_id: req.query.campaign_id,
    assigned_to: req.query.assigned_to,
    search: req.query.search,
    limit: 1000 // Set a reasonable limit for export
  };

  const leads = await Lead.list(filters);

  // Create CSV file path
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `leads-export-${timestamp}.csv`;
  const filepath = path.join(__dirname, '../../tmp', filename);

  // Ensure tmp directory exists
  const tmpDir = path.dirname(filepath);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Create CSV writer
  const csvWriter = csv.createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'first_name', title: 'First Name' },
      { id: 'last_name', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'company', title: 'Company' },
      { id: 'position', title: 'Position' },
      { id: 'status', title: 'Status' },
      { id: 'source', title: 'Source' },
      { id: 'value', title: 'Value' },
      { id: 'campaign_name', title: 'Campaign' },
      { id: 'assigned_first_name', title: 'Assigned First Name' },
      { id: 'assigned_last_name', title: 'Assigned Last Name' },
      { id: 'created_at', title: 'Created At' },
      { id: 'notes', title: 'Notes' }
    ]
  });

  // Write CSV data
  await csvWriter.writeRecords(leads);

  logger.info(`CSV export generated: ${filename} by user ${req.user.id}`);

  // Send file for download
  res.download(filepath, filename, (err) => {
    if (err) {
      logger.error('Error sending CSV file:', err);
      res.status(500).json({
        success: false,
        message: 'Error generating CSV export'
      });
    }

    // Clean up file after download
    setTimeout(() => {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }, 5000);
  });
}));

module.exports = router;
