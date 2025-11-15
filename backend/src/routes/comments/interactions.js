/**
 * Comment Interaction Tracking Routes
 * Handles tracking of user interactions with comments for algorithm support
 * Pure PostgreSQL implementation - NO SEQUELIZE
 */

const express = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation');

// Import PostgreSQL models
const Comment = require('../../models/Comment');
const CommentInteraction = require('../../models/CommentInteraction');

const router = express.Router();

/**
 * POST /api/comments/track-interaction
 * Track user interactions with comments for algorithm support
 */
router.post('/track-interaction',
  [
    body('comment_id').isInt({ min: 1 }).withMessage('Comment ID is required and must be a positive integer'),
    body('interaction_type').isIn(['view', 'reply', 'reaction', 'share', 'deep_read', 'quote'])
      .withMessage('Invalid interaction type'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { comment_id, interaction_type, metadata = {} } = req.body;
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;
      const sessionId = req.sessionID || `anon_${Date.now()}_${Math.random()}`;

      // Verify comment exists
      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Track the interaction
      const interaction = await CommentInteraction.create({
        comment_id,
        interaction_type,
        user_id: req.user?.id || null,
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata
      });

      res.json({
        success: true,
        data: {
          interaction_id: interaction.id,
          message: 'Interaction tracked successfully'
        }
      });

    } catch (error) {
      console.error('Interaction tracking error:', error);
      next(error);
    }
  }
);

module.exports = router;
