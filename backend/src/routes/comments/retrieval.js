/**
 * Comments retrieval routes for the social media platform API
 * Handles retrieval of comments and nested replies on posts
 * Pure PostgreSQL implementation - NO SEQUELIZE
 */

const express = require('express');
const { param, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation');

// Import PostgreSQL models
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Reaction = require('../../models/Reaction');
const CommentInteraction = require('../../models/CommentInteraction');
const CommentMetrics = require('../../models/CommentMetrics');

const router = express.Router();

/**
 * GET /api/comments/post/:postId
 * Get all comments for a specific post in hierarchical structure
 */
router.get('/post/:postId',
  [
    param('postId').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
    query('sort').optional().isIn(['newest', 'oldest']).withMessage('Sort must be newest or oldest'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const sort = req.query.sort || 'oldest';
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      // Verify post exists
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

      // Get total count of all comments for this post (including replies)
      const totalCountResult = await Comment.raw(
        `SELECT COUNT(*) as total_count
         FROM comments c
         WHERE c.post_id = $1 AND c.is_published = true`,
        [postId]
      );
      const totalCount = parseInt(totalCountResult.rows[0].total_count);

      // Get all comments for the post with author and reaction data
      const orderDirection = sort === 'newest' ? 'DESC' : 'ASC';

      // Get paginated comments for the post with media info (only top-level comments)
      const commentsResult = await Comment.raw(
        `SELECT c.*,
                u.username, u.first_name, u.last_name, u.avatar_url,
                m.id as media_id, m.filename, m.mime_type, m.file_size
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN media m ON c.id = m.comment_id
         WHERE c.post_id = $1 AND c.is_published = true AND c.parent_id IS NULL
         ORDER BY c.created_at ${orderDirection}
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      );

      // Get ALL nested replies for the returned top-level comments using recursive CTE
      const commentIds = commentsResult.rows.map(c => c.id);
      let repliesResult = { rows: [] };
      if (commentIds.length > 0) {
        repliesResult = await Comment.raw(
          `WITH RECURSIVE comment_replies AS (
            -- Base case: direct replies to top-level comments
            SELECT c.*,
                   u.username, u.first_name, u.last_name, u.avatar_url,
                   m.id as media_id, m.filename, m.mime_type, m.file_size,
                   1 as depth_level
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN media m ON c.id = m.comment_id
            WHERE c.parent_id = ANY($1) AND c.is_published = true

            UNION ALL

            -- Recursive case: replies to replies
            SELECT c.*,
                   u.username, u.first_name, u.last_name, u.avatar_url,
                   m.id as media_id, m.filename, m.mime_type, m.file_size,
                   cr.depth_level + 1
            FROM comments c
            JOIN comment_replies cr ON c.parent_id = cr.id
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN media m ON c.id = m.comment_id
            WHERE c.is_published = true AND cr.depth_level < 10
          )
          SELECT * FROM comment_replies ORDER BY created_at ${orderDirection}`,
          [commentIds]
        );
      }

      // Combine comments and replies
      const allComments = [...commentsResult.rows, ...repliesResult.rows];

      // Get all comment IDs (including replies) for bulk reaction query
      const allCommentIds = allComments.map(comment => comment.id);

      // Get all reaction counts in a single optimized query
      let reactionCountsMap = new Map();
      if (allCommentIds.length > 0) {
        const reactionsResult = await Comment.raw(
          `SELECT comment_id, emoji_name, COUNT(*) as count
           FROM reactions
           WHERE comment_id = ANY($1)
           GROUP BY comment_id, emoji_name
           ORDER BY comment_id, count DESC`,
          [allCommentIds]
        );

        // Build reaction counts map
        reactionsResult.rows.forEach(row => {
          const commentId = row.comment_id;
          if (!reactionCountsMap.has(commentId)) {
            reactionCountsMap.set(commentId, []);
          }
          reactionCountsMap.get(commentId).push({
            emoji_name: row.emoji_name,
            count: parseInt(row.count)
          });
        });
      }

      // Build hierarchical comment tree
      const commentMap = new Map();
      const rootComments = [];

      // Process comments and add reaction data
      const processedComments = allComments.map(comment => {
        const commentData = Comment.getCommentData(comment);

        // Add reaction counts from our bulk query
        commentData.reaction_counts = reactionCountsMap.get(comment.id) || [];
        commentData.replies = [];
        return commentData;
      });

      // Create map of all comments
      processedComments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      // Build parent-child relationships
      processedComments.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      // Sort replies recursively if needed
      const sortReplies = (comments) => {
        comments.forEach(comment => {
          if (comment.replies.length > 0) {
            comment.replies.sort((a, b) => {
              const dateA = new Date(a.created_at);
              const dateB = new Date(b.created_at);
              return sort === 'newest' ? dateB - dateA : dateA - dateB;
            });
            sortReplies(comment.replies);
          }
        });
      };

      sortReplies(rootComments);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: {
          post_id: postId,
          comments: rootComments,
          total_count: totalCount,
          sort,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            limit,
            has_next_page: hasNextPage,
            has_prev_page: hasPrevPage
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/comments/post/:postId/hierarchical
 * Enhanced hierarchical comment loading with algorithm support
 * Loads complete comment trees with all nested replies per batch
 */
router.get('/post/:postId/hierarchical',
  [
    param('postId').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
    query('sort').optional().isIn(['newest', 'oldest', 'hot', 'trending', 'best']).withMessage('Sort must be newest, oldest, hot, trending, or best'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('max_depth').optional().isInt({ min: 1, max: 10 }).withMessage('Max depth must be between 1 and 10'),
    query('load_all_replies').optional().isBoolean().withMessage('Load all replies must be true or false')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const sort = req.query.sort || 'oldest';
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const maxDepth = parseInt(req.query.max_depth) || 5;
      const loadAllReplies = req.query.load_all_replies === 'true';
      const offset = (page - 1) * limit;

      // Track this as a view interaction for the post
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;
      const sessionId = req.sessionID || `anon_${Date.now()}_${Math.random()}`;

      // Verify post exists
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

      // Get total count of all comments (including replies)
      const totalCountResult = await Comment.raw(
        `SELECT COUNT(*) as total_count
         FROM comments c
         WHERE c.post_id = $1 AND c.is_published = true`,
        [postId]
      );
      const totalCount = parseInt(totalCountResult.rows[0].total_count);

      // Algorithm-based sorting - always include metrics join
      let orderClause = 'ORDER BY c.created_at ASC';

      switch (sort) {
        case 'newest':
          orderClause = 'ORDER BY c.created_at DESC';
          break;
        case 'oldest':
          orderClause = 'ORDER BY c.created_at ASC';
          break;
        case 'hot':
        case 'trending':
        case 'best':
          const scoreColumn = sort === 'hot' || sort === 'trending' ? 'combined_algorithm_score' :
                              sort === 'best' ? 'engagement_score' : 'combined_algorithm_score';
          orderClause = `ORDER BY cm.${scoreColumn} DESC NULLS LAST, c.created_at DESC`;
          break;
      }

      // Simplified two-step approach for reliability
      // Step 1: Get paginated top-level comments with metrics
      const topLevelQuery = `
        SELECT
          c.*,
          u.username, u.first_name, u.last_name, u.avatar_url,
          m.id as media_id, m.filename, m.mime_type, m.file_size,
          COALESCE(cm.view_count, 0) as view_count,
          COALESCE(cm.reply_count, 0) as metric_reply_count,
          COALESCE(cm.reaction_count, 0) as metric_reaction_count,
          COALESCE(cm.combined_algorithm_score, 0) as algorithm_score
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN media m ON c.id = m.comment_id
        LEFT JOIN comment_metrics cm ON c.id = cm.comment_id
        WHERE c.post_id = $1 AND c.is_published = true AND c.parent_id IS NULL
        ${orderClause}
        LIMIT $2 OFFSET $3`;

      const commentsResult = await Comment.raw(topLevelQuery, [
        postId,
        limit,
        offset
      ]);

      // Step 2: Get all replies for the returned top-level comments
      const topLevelCommentIds = commentsResult.rows.map(c => c.id);
      let repliesResult = { rows: [] };

      if (topLevelCommentIds.length > 0 && (loadAllReplies || maxDepth > 1)) {
        const repliesQuery = `
          WITH RECURSIVE comment_replies AS (
            -- Base case: direct replies
            SELECT
              c.*,
              u.username, u.first_name, u.last_name, u.avatar_url,
              m.id as media_id, m.filename, m.mime_type, m.file_size,
              COALESCE(cm.view_count, 0) as view_count,
              COALESCE(cm.reply_count, 0) as metric_reply_count,
              COALESCE(cm.reaction_count, 0) as metric_reaction_count,
              COALESCE(cm.combined_algorithm_score, 0) as algorithm_score,
              1 as depth
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN media m ON c.id = m.comment_id
            LEFT JOIN comment_metrics cm ON c.id = cm.comment_id
            WHERE c.parent_id = ANY($1) AND c.is_published = true

            UNION ALL

            -- Recursive case: nested replies
            SELECT
              c.*,
              u.username, u.first_name, u.last_name, u.avatar_url,
              m.id as media_id, m.filename, m.mime_type, m.file_size,
              COALESCE(cm.view_count, 0) as view_count,
              COALESCE(cm.reply_count, 0) as metric_reply_count,
              COALESCE(cm.reaction_count, 0) as metric_reaction_count,
              COALESCE(cm.combined_algorithm_score, 0) as algorithm_score,
              cr.depth + 1
            FROM comments c
            JOIN comment_replies cr ON c.parent_id = cr.id
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN media m ON c.id = m.comment_id
            LEFT JOIN comment_metrics cm ON c.id = cm.comment_id
            WHERE c.is_published = true
            AND (cr.depth < $2 OR $3 = true)
          )
          SELECT * FROM comment_replies ORDER BY created_at ASC
        `;

        repliesResult = await Comment.raw(repliesQuery, [
          topLevelCommentIds,
          maxDepth - 1,
          loadAllReplies
        ]);
      }

      // Combine comments and replies
      const allComments = [...commentsResult.rows, ...repliesResult.rows];

      // Get all comment IDs for bulk reaction query
      const allCommentIds = allComments.map(comment => comment.id);

      // Get reaction counts in bulk
      let reactionCountsMap = new Map();
      if (allCommentIds.length > 0) {
        const reactionsResult = await Comment.raw(
          `SELECT comment_id, emoji_name, COUNT(*) as count
           FROM reactions
           WHERE comment_id = ANY($1)
           GROUP BY comment_id, emoji_name
           ORDER BY comment_id, count DESC`,
          [allCommentIds]
        );

        reactionsResult.rows.forEach(row => {
          const commentId = row.comment_id;
          if (!reactionCountsMap.has(commentId)) {
            reactionCountsMap.set(commentId, []);
          }
          reactionCountsMap.get(commentId).push({
            emoji_name: row.emoji_name,
            count: parseInt(row.count)
          });
        });
      }

      // Build hierarchical structure from flat recursive result
      const commentMap = new Map();
      const rootComments = [];

      // Process all comments and add enhanced data
      const processedComments = allComments.map(comment => {
        const commentData = Comment.getCommentData(comment);

        // Add enhanced metrics
        commentData.metrics = {
          view_count: comment.view_count || 0,
          reply_count: comment.metric_reply_count || 0,
          reaction_count: comment.metric_reaction_count || 0,
          algorithm_score: parseFloat(comment.algorithm_score) || 0
        };

        commentData.reaction_counts = reactionCountsMap.get(comment.id) || [];
        commentData.replies = [];
        commentData.depth = comment.depth || 0;

        return commentData;
      });

      // Build the tree structure
      processedComments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });

      processedComments.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      // Track views for all loaded comments (async, non-blocking)
      setImmediate(async () => {
        try {
          for (const commentId of allCommentIds) {
            await CommentInteraction.trackView(commentId, {
              user_id: req.user?.id || null,
              session_id: sessionId,
              ip_address: ipAddress,
              user_agent: userAgent
            });
          }
        } catch (error) {
          console.error('Error tracking comment views:', error);
        }
      });

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        data: {
          post_id: postId,
          comments: rootComments,
          total_count: totalCount,
          sort,
          algorithm_metadata: {
            sort_method: sort,
            max_depth: maxDepth,
            load_all_replies: loadAllReplies,
            interaction_tracking: true
          },
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            limit,
            has_next_page: hasNextPage,
            has_prev_page: hasPrevPage
          }
        }
      });

    } catch (error) {
      console.error('Hierarchical comment loading error:', error);
      next(error);
    }
  }
);

/**
 * GET /api/comments/:id/replies
 * Get all replies for a specific comment
 */
router.get('/:id/replies',
  [
    param('id').isInt({ min: 1 }).withMessage('Comment ID must be a positive integer'),
    query('sort').optional().isIn(['newest', 'oldest']).withMessage('Sort must be newest or oldest'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const commentId = parseInt(req.params.id);
      const sort = req.query.sort || 'oldest';
      const limit = parseInt(req.query.limit) || 20;

      // Verify parent comment exists
      const parentComment = await Comment.findById(commentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Comment not found',
            type: 'NOT_FOUND'
          }
        });
      }

      // Get replies with proper sorting and media
      const orderDirection = sort === 'newest' ? 'DESC' : 'ASC';
      const repliesResult = await Comment.raw(
        `SELECT c.*,
                u.username, u.first_name, u.last_name, u.avatar_url,
                m.id as media_id, m.filename, m.mime_type, m.file_size
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN media m ON c.id = m.comment_id
         WHERE c.parent_id = $1 AND c.is_published = true
         ORDER BY c.created_at ${orderDirection}
         LIMIT $2`,
        [commentId, limit]
      );

      // Get all reply IDs for bulk reaction query
      const replyIds = repliesResult.rows.map(comment => comment.id);

      // Get all reaction counts in a single optimized query
      let reactionCountsMap = new Map();
      if (replyIds.length > 0) {
        const reactionsResult = await Comment.raw(
          `SELECT comment_id, emoji_name, COUNT(*) as count
           FROM reactions
           WHERE comment_id = ANY($1)
           GROUP BY comment_id, emoji_name
           ORDER BY comment_id, count DESC`,
          [replyIds]
        );

        // Build reaction counts map
        reactionsResult.rows.forEach(row => {
          const commentId = row.comment_id;
          if (!reactionCountsMap.has(commentId)) {
            reactionCountsMap.set(commentId, []);
          }
          reactionCountsMap.get(commentId).push({
            emoji_name: row.emoji_name,
            count: parseInt(row.count)
          });
        });
      }

      // Process replies to include reaction counts
      const processedReplies = repliesResult.rows.map(comment => {
        const reply = Comment.getCommentData(comment);
        // Add reaction counts from our bulk query
        reply.reaction_counts = reactionCountsMap.get(comment.id) || [];
        return reply;
      });

      res.json({
        success: true,
        data: {
          parent_comment_id: commentId,
          replies: processedReplies,
          total_count: processedReplies.length,
          sort
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
