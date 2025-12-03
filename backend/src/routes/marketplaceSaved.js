const express = require('express');
const { param, query, body } = require('express-validator');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const MarketplaceSaved = require('../models/MarketplaceSaved');

/**
 * GET /api/marketplace/saved
 * Get user's saved listings
 */
router.get('/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('folder').optional().trim().isLength({ max: 100 }).withMessage('Folder name too long'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const folder = req.query.folder;
    const offset = (page - 1) * limit;

    const savedListings = await MarketplaceSaved.findByUser(req.user.id, {
      folder: folder === 'null' ? null : folder,
      limit,
      offset
    });

    res.json({
      success: true,
      data: savedListings
    });
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved listings'
    });
  }
});

/**
 * GET /api/marketplace/saved/folders
 * Get user's folder list
 */
router.get('/folders', authenticate, async (req, res) => {
  try {
    const folders = await MarketplaceSaved.getFolders(req.user.id);

    res.json({
      success: true,
      data: folders
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch folders'
    });
  }
});

/**
 * PUT /api/marketplace/saved/:listingId/folder
 * Update folder for saved listing
 */
router.put('/:listingId/folder',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    body('folder').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Folder name too long'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { folder } = req.body;

    const updated = await MarketplaceSaved.updateFolder(
      req.user.id,
      listingId,
      folder
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Saved listing not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update folder'
    });
  }
});

/**
 * PUT /api/marketplace/saved/:listingId/notes
 * Update notes for saved listing
 */
router.put('/:listingId/notes',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { notes } = req.body;

    const updated = await MarketplaceSaved.updateNotes(
      req.user.id,
      listingId,
      notes
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Saved listing not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notes'
    });
  }
});

/**
 * POST /api/marketplace/saved/:listingId
 * Save a listing
 */
router.post('/:listingId',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    body('folder').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Folder name too long'),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { folder, notes } = req.body;

    const saved = await MarketplaceSaved.save(
      req.user.id,
      listingId,
      folder || null,
      notes || null
    );

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Listing saved successfully'
    });
  } catch (error) {
    console.error('Error saving listing:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        error: 'Listing already saved'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to save listing'
    });
  }
});

/**
 * DELETE /api/marketplace/saved/:listingId
 * Unsave a listing
 */
router.delete('/:listingId',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);

    const deleted = await MarketplaceSaved.unsave(req.user.id, listingId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Saved listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Listing removed from saved'
    });
  } catch (error) {
    console.error('Error unsaving listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave listing'
    });
  }
});

/**
 * GET /api/marketplace/saved/:listingId/status
 * Check if listing is saved
 */
router.get('/:listingId/status',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);

    const isSaved = await MarketplaceSaved.isSaved(req.user.id, listingId);

    res.json({
      success: true,
      data: { isSaved }
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check saved status'
    });
  }
});

/**
 * PUT /api/marketplace/saved/:listingId/price-alert
 * Set price alert for saved listing
 */
router.put('/:listingId/price-alert',
  authenticate,
  [
    param('listingId').isInt({ min: 1 }).withMessage('Valid listing ID is required'),
    body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
    body('threshold').optional().isFloat({ min: 0 }).withMessage('Threshold must be a positive number'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { enabled, threshold } = req.body;

    if (enabled && !threshold) {
      return res.status(400).json({
        success: false,
        error: 'Threshold is required when enabling price alert'
      });
    }

    const updated = await MarketplaceSaved.setPriceAlert(
      req.user.id,
      listingId,
      enabled,
      threshold
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Saved listing not found'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: enabled ? 'Price alert enabled' : 'Price alert disabled'
    });
  } catch (error) {
    console.error('Error setting price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set price alert'
    });
  }
});

module.exports = router;
