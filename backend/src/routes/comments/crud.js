/**
 * CRUD routes for comments
 * Handles Create, Read, Update, Delete operations on comments
 * Pure PostgreSQL implementation - NO SEQUELIZE
 */

const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const { handleValidationErrors } = require('../../middleware/validation');

// Import PostgreSQL models
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Reaction = require('../../models/Reaction');
const Notification = require('../../models/Notification');

const router = express.Router();

/**
 * GET /api/comments/:id
 * Get a single comment by ID with replies
 */
router.get('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);

      // Find comment with media and user associations
      const commentResult = await Comment.raw(
        `SELECT c.*,
                u.username, u.first_name, u.last_name, u.avatar_url,
                m.id as media_id, m.filename, m.mime_type, m.file_size
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN media m ON c.id = m.comment_id
         WHERE c.id = $1`,
        [commentId]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            type: 'NOT_FOUND'
          }
        });
      }

      const comment = commentResult.rows[0];
      const commentData = Comment.getCommentData(comment);

      // Get reaction counts separately
      try {
        const reactionCounts = await Reaction.getCommentReactionCounts(comment.id);
        commentData.reaction_counts = reactionCounts;
      } catch (error) {
        commentData.reaction_counts = [];
      }

      // Get replies separately
      try {
        const replies = await Comment.getReplies(comment.id);
        commentData.replies = replies;
      } catch (error) {
        commentData.replies = [];
      }

      res.json({
        success: true,
        data: commentData
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/comments
 * Create a new comment or reply
 */
router.post('/',
  authenticate,
  [
    body('post_id').isInt({ min: 1 }).withMessage('Post ID is required and must be a positive integer'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
    body('parent_id').optional().isInt({ min: 1 }).withMessage('Parent ID must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { post_id, content, parent_id } = req.body;
      const user_id = req.user.id; // Get user from authentication

      // Verify post exists
      const post = await Post.findById(post_id);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Post not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // If parent_id is provided, verify parent comment exists and belongs to same post
      if (parent_id) {
        const parentComment = await Comment.findById(parent_id);
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'Parent comment not found',
              type: 'NOT_FOUND'
            }
          });
        }
        if (parentComment.post_id !== post_id) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Parent comment must belong to the same post',
              type: 'INVALID_PARENT'
            }
          });
        }

        // Check nesting depth
        const depth = await Comment.getCommentDepth(parent_id);
        if (depth >= 5) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'Maximum comment nesting depth exceeded (5 levels)',
              type: 'MAX_DEPTH_EXCEEDED'
            }
          });
        }
      }

      // Create the comment
      const comment = await Comment.create({
        post_id,
        user_id,
        parent_id,
        content
      });

      // Fetch the comment with author info
      const commentResult = await Comment.raw(
        `SELECT c.*, u.username, u.first_name, u.last_name, u.avatar_url
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [comment.id]
      );

      const newComment = Comment.getCommentData(commentResult.rows[0]);

      // Create notifications
      if (parent_id) {
        // Reply notification - notify parent comment author
        const parentComment = await Comment.findById(parent_id);
        if (parentComment && parentComment.user_id !== user_id) {
          try {
            await Notification.create({
              user_id: parentComment.user_id,
              type: 'comment_reply',
              title: 'New Reply',
              message: `${req.user.username} replied to your comment`,
              actor_id: user_id,
              entity_type: 'comment',
              entity_id: comment.id,
              action_url: `/posts/${post_id}#comment-${comment.id}`,
              priority: 'normal'
            });
          } catch (notifError) {
            console.error('Failed to create reply notification:', notifError);
          }
        }
      } else {
        // Comment notification - notify post author
        if (post.user_id !== user_id) {
          try {
            await Notification.create({
              user_id: post.user_id,
              type: 'comment',
              title: 'New Comment',
              message: `${req.user.username} commented on your post`,
              actor_id: user_id,
              entity_type: 'comment',
              entity_id: comment.id,
              action_url: `/posts/${post_id}#comment-${comment.id}`,
              priority: 'normal'
            });
          } catch (notifError) {
            console.error('Failed to create comment notification:', notifError);
          }
        }
      }

      res.status(201).json({
        success: true,
        data: newComment,
        message: parent_id ? 'Reply created successfully' : 'Comment created successfully'
      });

    } catch (error) {
      console.error('Comment creation error:', error);

      // Handle specific validation errors
      if (error.message.includes('Maximum comment nesting depth exceeded')) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            type: 'MAX_DEPTH_EXCEEDED'
          }
        });
      }

      if (error.message.includes('Parent comment must belong to the same post')) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            type: 'INVALID_PARENT'
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create comment',
          type: 'INTERNAL_ERROR',
          details: error.message
        }
      });
    }
  }
);

/**
 * PUT /api/comments/:id
 * Update a comment
 */
router.put('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Update comment content
      const updatedComment = await Comment.update(commentId, { content });

      // Fetch updated comment with author info
      const commentResult = await Comment.raw(
        `SELECT c.*, u.username, u.first_name, u.last_name, u.avatar_url
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [commentId]
      );

      res.json({
        success: true,
        data: Comment.getCommentData(commentResult.rows[0]),
        message: 'Comment updated successfully'
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/comments/:id
 * Delete a comment and all its replies
 */
router.delete('/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);

      // Find the comment
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Count replies that will be deleted
      const replyCountResult = await Comment.raw(
        'SELECT COUNT(*) as count FROM comments WHERE parent_id = $1',
        [commentId]
      );
      const replyCount = parseInt(replyCountResult.rows[0].count);

      // Delete the comment (cascading deletes will handle replies and reactions)
      await Comment.delete(commentId);

      res.json({
        success: true,
        message: `Comment deleted successfully${replyCount > 0 ? ` along with ${replyCount} replies` : ''}`
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
