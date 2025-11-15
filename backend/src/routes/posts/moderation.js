/**
 * Posts moderation routes
 * Handles admin moderation actions on posts (soft delete, restore)
 * Pure PostgreSQL implementation - NO SEQUELIZE
 */

const express = require('express');
const { body, param } = require('express-validator');
const {
  authenticate
} = require('../../middleware/auth');
const { handleValidationErrors } = require('../../middleware/validation');

// Import PostgreSQL models
const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

/**
 * Admin soft delete a post (moderator action)
 * POST /api/posts/:id/moderate/delete
 */
router.post('/:id/moderate/delete',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      const { reason } = req.body;

      // Check if user is admin (you may want to add a proper admin check here)
      // For now, assuming user_id 1 is admin or check user.role === 'admin'
      const user = await User.findById(req.user.id);
      if (!user || (user.id !== 1 && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can moderate posts',
            type: 'AUTHORIZATION_ERROR'
          }
        });
      }

      // Find the post
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Post not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Check if already deleted
      if (post.deleted_at) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Post is already deleted',
            type: 'ALREADY_DELETED'
          }
        });
      }

      // Soft delete the post
      await Post.softDelete(postId, req.user.id, reason || 'Removed by moderator');

      res.json({
        success: true,
        message: 'Post has been removed',
        data: {
          post_id: postId,
          deleted_by: req.user.id,
          reason: reason || 'Removed by moderator'
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * Admin restore a soft-deleted post
 * POST /api/posts/:id/moderate/restore
 */
router.post('/:id/moderate/restore',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Post ID must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);

      // Check if user is admin
      const user = await User.findById(req.user.id);
      if (!user || (user.id !== 1 && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can restore posts',
            type: 'AUTHORIZATION_ERROR'
          }
        });
      }

      // Find the post
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Post not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Check if it's actually deleted
      if (!post.deleted_at) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Post is not deleted',
            type: 'NOT_DELETED'
          }
        });
      }

      // Restore the post
      await Post.restorePost(postId);

      res.json({
        success: true,
        message: 'Post has been restored',
        data: {
          post_id: postId
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
