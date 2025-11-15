const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const MarketplaceListing = require('../../models/MarketplaceListing');
const MarketplaceSaved = require('../../models/MarketplaceSaved');
const db = require('../../config/database');

/**
 * POST /api/marketplace/listings
 * Create a new listing
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title, description, category_id, listing_type = 'sale',
      price, original_price, quantity = 1, allow_offers = false,
      min_offer_price, condition, location_latitude, location_longitude,
      location_city, location_state, location_zip, location_country,
      pickup_address, shipping_available = false, shipping_cost,
      shipping_radius_miles, local_pickup_only = true, status = 'draft'
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    if (!location_latitude || !location_longitude || !location_city || !location_state) {
      return res.status(400).json({
        success: false,
        error: 'Location information is required'
      });
    }

    if (listing_type === 'sale' && !price) {
      return res.status(400).json({
        success: false,
        error: 'Price is required for sale listings'
      });
    }

    const listing = await MarketplaceListing.create({
      user_id: req.user.id,
      title,
      description,
      category_id,
      listing_type,
      price,
      original_price,
      quantity,
      allow_offers,
      min_offer_price,
      condition,
      location_latitude,
      location_longitude,
      location_city,
      location_state,
      location_zip,
      location_country,
      pickup_address,
      shipping_available,
      shipping_cost,
      shipping_radius_miles,
      local_pickup_only,
      status
    });

    res.status(201).json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listing'
    });
  }
});

/**
 * GET /api/marketplace/listings/my-listings
 * Get current user's listings
 */
router.get('/my-listings', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const listings = await MarketplaceListing.findByUser(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    });
  }
});

/**
 * GET /api/marketplace/listings/:id
 * Get listing by ID with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const requestingUserId = req.user ? req.user.id : null;
    const listing = await MarketplaceListing.findById(
      parseInt(req.params.id),
      requestingUserId
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing'
    });
  }
});

/**
 * PUT /api/marketplace/listings/:id
 * Update listing (owner only)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const updateData = req.body;

    const listing = await MarketplaceListing.update(
      listingId,
      req.user.id,
      updateData
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission to update it'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update listing'
    });
  }
});

/**
 * DELETE /api/marketplace/listings/:id
 * Delete listing (owner only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const deleted = await MarketplaceListing.delete(listingId, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete listing'
    });
  }
});

/**
 * POST /api/marketplace/listings/:id/save
 * Save/favorite a listing
 */
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const { folder, notes } = req.body;

    const saved = await MarketplaceSaved.save(
      req.user.id,
      listingId,
      folder,
      notes
    );

    res.json({
      success: true,
      data: saved
    });
  } catch (error) {
    console.error('Error saving listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save listing'
    });
  }
});

/**
 * DELETE /api/marketplace/listings/:id/save
 * Unsave a listing
 */
router.delete('/:id/save', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);
    const unsaved = await MarketplaceSaved.unsave(req.user.id, listingId);

    if (!unsaved) {
      return res.status(404).json({
        success: false,
        error: 'Saved listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Listing unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave listing'
    });
  }
});

module.exports = router;
