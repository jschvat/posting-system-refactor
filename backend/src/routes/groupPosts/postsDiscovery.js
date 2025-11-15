const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, optionalAuthenticate: optionalAuth } = require('../../middleware/auth');
const Group = require('../../models/Group');
const GroupPost = require('../../models/GroupPost');
const GroupMembership = require('../../models/GroupMembership');

/**
 * @route   GET /api/groups/:slug/posts/pending
 * @desc    Get pending posts (requiring approval)
 * @access  Private (Moderator only)
 */
router.get('/:slug/posts/pending', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can view pending posts'
      });
    }

    const posts = await GroupPost.getPendingPosts(group.id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error getting pending posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending posts'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/posts/top
 * @desc    Get top posts in a time period
 * @access  Public (for public groups) / Members only (for private groups)
 */
router.get('/:slug/posts/top', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { period = 'week', limit = 20, offset = 0 } = req.query;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check visibility
    if (group.visibility === 'private') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const isMember = await GroupMembership.isMember(group.id, req.user.id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'Only members can view posts in private groups'
        });
      }
    }

    const posts = await GroupPost.getTopPosts(group.id, {
      period,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Error getting top posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get top posts'
    });
  }
});

module.exports = router;
