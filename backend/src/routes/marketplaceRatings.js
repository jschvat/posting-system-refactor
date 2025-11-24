/**
 * Marketplace Seller Ratings Routes
 * API endpoints for seller ratings and reviews
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

/**
 * GET /api/marketplace/ratings/seller/:sellerId
 * Get ratings and stats for a seller
 */
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get seller stats
    const statsResult = await db.query(`
      SELECT
        mss.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM marketplace_seller_stats mss
      LEFT JOIN users u ON mss.user_id = u.id
      WHERE mss.user_id = $1
    `, [sellerId]);

    // Get individual ratings with pagination
    const ratingsResult = await db.query(`
      SELECT
        msr.*,
        u.username as buyer_username,
        u.first_name as buyer_first_name,
        u.avatar_url as buyer_avatar,
        ml.title as listing_title,
        COUNT(*) OVER() as total_count
      FROM marketplace_seller_ratings msr
      LEFT JOIN users u ON msr.buyer_id = u.id
      LEFT JOIN marketplace_listings ml ON msr.listing_id = ml.id
      WHERE msr.seller_id = $1 AND msr.is_hidden = FALSE
      ORDER BY msr.created_at DESC
      LIMIT $2 OFFSET $3
    `, [sellerId, parseInt(limit), offset]);

    const totalCount = ratingsResult.rows.length > 0 ? parseInt(ratingsResult.rows[0].total_count) : 0;
    const ratings = ratingsResult.rows.map(row => {
      const { total_count, ...rating } = row;
      return rating;
    });

    // If no stats exist yet, create default
    let stats = statsResult.rows[0];
    if (!stats) {
      stats = {
        user_id: parseInt(sellerId),
        total_reviews: 0,
        average_rating: 0,
        seller_level: 'new',
        rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
      };
    }

    res.json({
      success: true,
      data: {
        stats,
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller ratings'
    });
  }
});

/**
 * POST /api/marketplace/ratings
 * Create a rating for a seller (requires auth)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      seller_id,
      listing_id,
      transaction_id,
      rating,
      review_title,
      review_text,
      communication_rating,
      shipping_speed_rating,
      item_as_described_rating,
      packaging_rating,
      bird_health_rating,
      bird_temperament_accurate,
      bird_documentation_provided
    } = req.body;

    // Validate required fields
    if (!seller_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if user is not rating themselves
    if (parseInt(seller_id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot rate yourself'
      });
    }

    // Check if user already rated this seller for this listing/transaction
    const existingRating = await db.query(`
      SELECT id FROM marketplace_seller_ratings
      WHERE buyer_id = $1 AND seller_id = $2 AND listing_id = $3
    `, [req.user.id, seller_id, listing_id || null]);

    if (existingRating.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already rated this seller for this listing'
      });
    }

    // Check if this is a verified purchase (user bought from seller)
    let isVerifiedPurchase = false;
    if (transaction_id) {
      const transactionCheck = await db.query(`
        SELECT id FROM marketplace_transactions
        WHERE id = $1 AND buyer_id = $2 AND seller_id = $3 AND status = 'completed'
      `, [transaction_id, req.user.id, seller_id]);
      isVerifiedPurchase = transactionCheck.rows.length > 0;
    }

    // Insert rating
    const result = await db.query(`
      INSERT INTO marketplace_seller_ratings (
        seller_id, buyer_id, transaction_id, listing_id,
        rating, review_title, review_text,
        communication_rating, shipping_speed_rating,
        item_as_described_rating, packaging_rating,
        bird_health_rating, bird_temperament_accurate,
        bird_documentation_provided, is_verified_purchase
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      seller_id,
      req.user.id,
      transaction_id || null,
      listing_id || null,
      rating,
      review_title || null,
      review_text || null,
      communication_rating || null,
      shipping_speed_rating || null,
      item_as_described_rating || null,
      packaging_rating || null,
      bird_health_rating || null,
      bird_temperament_accurate || null,
      bird_documentation_provided || null,
      isVerifiedPurchase
    ]);

    // Update seller stats
    await updateSellerStats(seller_id);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rating'
    });
  }
});

/**
 * PUT /api/marketplace/ratings/:id/response
 * Seller responds to a rating
 */
router.put('/:id/response', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { seller_response } = req.body;

    // Check if user is the seller
    const ratingCheck = await db.query(`
      SELECT seller_id FROM marketplace_seller_ratings WHERE id = $1
    `, [id]);

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    if (ratingCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the seller can respond to this rating'
      });
    }

    const result = await db.query(`
      UPDATE marketplace_seller_ratings
      SET seller_response = $1, seller_responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [seller_response, id]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error adding seller response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add response'
    });
  }
});

/**
 * POST /api/marketplace/ratings/:id/flag
 * Flag a rating for review
 */
router.post('/:id/flag', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await db.query(`
      UPDATE marketplace_seller_ratings
      SET is_flagged = TRUE, flag_reason = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [reason, id]);

    res.json({
      success: true,
      message: 'Rating flagged for review'
    });
  } catch (error) {
    console.error('Error flagging rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to flag rating'
    });
  }
});

/**
 * PUT /api/marketplace/ratings/:id
 * Edit a rating (only by the buyer who created it)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating,
      review_title,
      review_text,
      communication_rating,
      shipping_speed_rating,
      item_as_described_rating
    } = req.body;

    // Check if user is the buyer who created this rating
    const ratingCheck = await db.query(`
      SELECT buyer_id, seller_id FROM marketplace_seller_ratings WHERE id = $1
    `, [id]);

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    if (ratingCheck.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own reviews'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const result = await db.query(`
      UPDATE marketplace_seller_ratings
      SET
        rating = COALESCE($1, rating),
        review_title = COALESCE($2, review_title),
        review_text = COALESCE($3, review_text),
        communication_rating = COALESCE($4, communication_rating),
        shipping_speed_rating = COALESCE($5, shipping_speed_rating),
        item_as_described_rating = COALESCE($6, item_as_described_rating),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [rating, review_title, review_text, communication_rating, shipping_speed_rating, item_as_described_rating, id]);

    // Update seller stats
    await updateSellerStats(ratingCheck.rows[0].seller_id);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rating'
    });
  }
});

/**
 * DELETE /api/marketplace/ratings/:id
 * Delete a rating (only by the buyer who created it)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is the buyer who created this rating
    const ratingCheck = await db.query(`
      SELECT buyer_id, seller_id FROM marketplace_seller_ratings WHERE id = $1
    `, [id]);

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    if (ratingCheck.rows[0].buyer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own reviews'
      });
    }

    await db.query('DELETE FROM marketplace_seller_ratings WHERE id = $1', [id]);

    // Update seller stats
    await updateSellerStats(ratingCheck.rows[0].seller_id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rating'
    });
  }
});

/**
 * PUT /api/marketplace/ratings/:id/admin/hide
 * Admin: Hide/unhide a review
 */
router.put('/:id/admin/hide', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_hidden, hide_reason } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const ratingCheck = await db.query(`
      SELECT seller_id FROM marketplace_seller_ratings WHERE id = $1
    `, [id]);

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    const result = await db.query(`
      UPDATE marketplace_seller_ratings
      SET is_hidden = $1, admin_hide_reason = $2, admin_hidden_by = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [is_hidden, hide_reason, req.user.id, id]);

    // Update seller stats
    await updateSellerStats(ratingCheck.rows[0].seller_id);

    res.json({
      success: true,
      data: result.rows[0],
      message: is_hidden ? 'Review hidden successfully' : 'Review restored successfully'
    });
  } catch (error) {
    console.error('Error hiding/unhiding rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rating visibility'
    });
  }
});

/**
 * DELETE /api/marketplace/ratings/:id/admin
 * Admin: Permanently delete a review
 */
router.delete('/:id/admin', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const ratingCheck = await db.query(`
      SELECT seller_id FROM marketplace_seller_ratings WHERE id = $1
    `, [id]);

    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    await db.query('DELETE FROM marketplace_seller_ratings WHERE id = $1', [id]);

    // Update seller stats
    await updateSellerStats(ratingCheck.rows[0].seller_id);

    res.json({
      success: true,
      message: 'Review permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting rating (admin):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete rating'
    });
  }
});

/**
 * GET /api/marketplace/ratings/admin/flagged
 * Admin: Get all flagged reviews
 */
router.get('/admin/flagged', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await db.query(`
      SELECT
        msr.*,
        bu.username as buyer_username,
        su.username as seller_username,
        ml.title as listing_title,
        COUNT(*) OVER() as total_count
      FROM marketplace_seller_ratings msr
      LEFT JOIN users bu ON msr.buyer_id = bu.id
      LEFT JOIN users su ON msr.seller_id = su.id
      LEFT JOIN marketplace_listings ml ON msr.listing_id = ml.id
      WHERE msr.is_flagged = TRUE
      ORDER BY msr.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const ratings = result.rows.map(row => {
      const { total_count, ...rating } = row;
      return rating;
    });

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching flagged ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flagged ratings'
    });
  }
});

/**
 * PUT /api/marketplace/ratings/:id/admin/unflag
 * Admin: Clear flag from a review
 */
router.put('/:id/admin/unflag', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const result = await db.query(`
      UPDATE marketplace_seller_ratings
      SET is_flagged = FALSE, flag_reason = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Flag cleared successfully'
    });
  } catch (error) {
    console.error('Error unflagging rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear flag'
    });
  }
});

/**
 * GET /api/marketplace/ratings/my-stats
 * Get current user's seller stats
 */
router.get('/my-stats', authenticate, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM marketplace_seller_stats WHERE user_id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          user_id: req.user.id,
          total_reviews: 0,
          average_rating: 0,
          seller_level: 'new',
          rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching my stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your stats'
    });
  }
});

/**
 * Helper function to update seller statistics
 */
async function updateSellerStats(sellerId) {
  try {
    const statsQuery = await db.query(`
      SELECT
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM marketplace_seller_ratings
      WHERE seller_id = $1 AND is_hidden = FALSE
    `, [sellerId]);

    const stats = statsQuery.rows[0];

    // Determine tier (matching the CHECK constraint: new, bronze, silver, gold, platinum)
    let tier = 'new';
    if (stats.total >= 30 && stats.avg_rating >= 4.5) tier = 'platinum';
    else if (stats.total >= 15 && stats.avg_rating >= 4.2) tier = 'gold';
    else if (stats.total >= 5 && stats.avg_rating >= 3.8) tier = 'silver';
    else if (stats.total >= 1) tier = 'bronze';

    const ratingDistribution = JSON.stringify({
      "1": parseInt(stats.one_star) || 0,
      "2": parseInt(stats.two_star) || 0,
      "3": parseInt(stats.three_star) || 0,
      "4": parseInt(stats.four_star) || 0,
      "5": parseInt(stats.five_star) || 0
    });

    await db.query(`
      INSERT INTO marketplace_seller_stats (
        user_id, total_reviews, average_rating, rating_distribution, seller_level
      ) VALUES ($1, $2, $3, $4::jsonb, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        rating_distribution = EXCLUDED.rating_distribution,
        seller_level = EXCLUDED.seller_level,
        updated_at = CURRENT_TIMESTAMP
    `, [
      sellerId,
      stats.total || 0,
      stats.avg_rating || 0,
      ratingDistribution,
      tier
    ]);
  } catch (error) {
    console.error('Error updating seller stats:', error);
  }
}

module.exports = router;
