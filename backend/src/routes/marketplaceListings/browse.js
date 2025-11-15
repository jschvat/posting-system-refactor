const express = require('express');
const router = express.Router();
const MarketplaceListing = require('../../models/MarketplaceListing');
const db = require('../../config/database');

/**
 * GET /api/marketplace/listings
 * Search/browse listings with filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      query,
      category_id,
      listing_type,
      min_price,
      max_price,
      condition,
      latitude,
      longitude,
      radius,
      status = 'active',
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await MarketplaceListing.search({
      query,
      category_id: category_id ? parseInt(category_id) : undefined,
      listing_type,
      min_price: min_price ? parseFloat(min_price) : undefined,
      max_price: max_price ? parseFloat(max_price) : undefined,
      condition,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      radius: radius ? parseInt(radius) : undefined,
      status,
      sort_by,
      sort_order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: result.listings,
      pagination: {
        page: result.page,
        pages: result.pages,
        total: result.total,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search listings'
    });
  }
});

/**
 * GET /api/marketplace/listings/nearby
 * Get nearby listings based on location
 */
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 25, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const listings = await MarketplaceListing.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Error finding nearby listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby listings'
    });
  }
});

module.exports = router;
