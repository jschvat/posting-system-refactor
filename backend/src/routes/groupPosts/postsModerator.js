const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken } = require('../../middleware/auth');
const { canModerate } = require('../../utils/permissions');
const Group = require('../../models/Group');
const GroupPost = require('../../models/GroupPost');
const GroupMembership = require('../../models/GroupMembership');
const db = require('../../config/database');

/**
 * @route   POST /api/groups/:slug/posts/:postId/pin
 * @desc    Pin/unpin a post
 * @access  Private (Moderator only)
 */
router.post('/:slug/posts/:postId/pin', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_pin_posts');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to pin posts'
      });
    }

    const post = await GroupPost.togglePin(parseInt(postId));

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pin post'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts/:postId/lock
 * @desc    Lock/unlock a post
 * @access  Private (Moderator only)
 */
router.post('/:slug/posts/:postId/lock', authenticateToken, async (req, res) => {
  try {
    const { slug, postId} = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_lock_posts');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to lock posts'
      });
    }

    const post = await GroupPost.toggleLock(parseInt(postId));

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error locking post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lock post'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts/:postId/remove
 * @desc    Remove a post (moderator action)
 * @access  Private (Moderator only)
 */
router.post('/:slug/posts/:postId/remove', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const { removal_reason } = req.body;

    if (!removal_reason) {
      return res.status(400).json({
        success: false,
        error: 'Removal reason is required'
      });
    }

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_remove_posts');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to remove posts'
      });
    }

    const post = await GroupPost.remove(parseInt(postId), req.user.id, removal_reason);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error removing post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove post'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts/:postId/approve
 * @desc    Approve a pending post
 * @access  Private (Moderator only)
 */
router.post('/:slug/posts/:postId/approve', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_approve_posts');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to approve posts'
      });
    }

    const post = await GroupPost.approve(parseInt(postId), req.user.id);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve post'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts/:postId/reject
 * @desc    Reject a pending post
 * @access  Private (Moderators/Admins only)
 */
router.post('/:slug/posts/:postId/reject', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const { rejection_reason } = req.body;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can reject posts'
      });
    }

    // Delete the post (rejected posts are removed)
    await GroupPost.delete(parseInt(postId));

    res.json({
      success: true,
      message: 'Post rejected and removed',
      data: { rejection_reason }
    });
  } catch (error) {
    console.error('Error rejecting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject post'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts/:postId/restore
 * @desc    Restore a removed post
 * @access  Private (Moderators/Admins only)
 */
router.post('/:slug/posts/:postId/restore', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can restore posts'
      });
    }

    const post = await GroupPost.restore(parseInt(postId));

    res.json({
      success: true,
      data: post,
      message: 'Post restored successfully'
    });
  } catch (error) {
    console.error('Error restoring post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore post'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/posts/removed
 * @desc    Get removed posts (for moderation review)
 * @access  Private (Moderators/Admins only)
 */
router.get('/:slug/posts/removed', authenticateToken, async (req, res) => {
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

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can view removed posts'
      });
    }

    const posts = await GroupPost.list({
      group_id: group.id,
      status: 'removed',
      limit: parseInt(limit),
      offset: parseInt(offset),
      include_removed: true
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error getting removed posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get removed posts'
    });
  }
});

/**
 * Get all posts for moderation (including deleted)
 * GET /api/groups/:slug/posts/moderate/all
 */
router.get('/:slug/posts/moderate/all', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 20, offset = 0, include_deleted = 'true' } = req.query;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can access this endpoint'
      });
    }

    // Get all posts including soft-deleted ones
    const query = `
      SELECT
        gp.*,
        u.username, u.first_name, u.last_name, u.avatar_url,
        COALESCE(ur.reputation_score, 0) as reputation_score
      FROM group_posts gp
      JOIN users u ON gp.user_id = u.id
      LEFT JOIN user_reputation ur ON u.id = ur.user_id
      WHERE gp.group_id = $1
      ORDER BY gp.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [group.id, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rowCount
        }
      }
    });
  } catch (error) {
    console.error('Error getting all posts for moderation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get posts'
    });
  }
});

/**
 * Soft delete a group post (admin/moderator)
 * POST /api/groups/:slug/posts/:postId/moderate/delete
 */
router.post('/:slug/posts/:postId/moderate/delete', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const { reason } = req.body;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can delete posts'
      });
    }

    // Check if the post exists and belongs to this group
    const groupPost = await GroupPost.findByPostId(parseInt(postId));
    if (!groupPost || groupPost.group_id !== group.id) {
      return res.status(404).json({
        success: false,
        error: 'Post not found in this group'
      });
    }

    // For group posts, we'll use the status='removed' system
    await GroupPost.remove(groupPost.id, req.user.id, reason || 'Removed by moderator');

    res.json({
      success: true,
      message: 'Post has been removed',
      data: {
        post_id: parseInt(postId),
        removed_by: req.user.id,
        reason: reason || 'Removed by moderator'
      }
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

/**
 * Restore a removed group post (admin/moderator)
 * POST /api/groups/:slug/posts/:postId/moderate/restore
 */
router.post('/:slug/posts/:postId/moderate/restore', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is moderator or admin
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    if (!isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only moderators can restore posts'
      });
    }

    // Check if the post exists and belongs to this group
    const groupPost = await GroupPost.findByPostId(parseInt(postId));
    if (!groupPost || groupPost.group_id !== group.id) {
      return res.status(404).json({
        success: false,
        error: 'Post not found in this group'
      });
    }

    // Approve the post (changes status from 'removed' to 'approved')
    await GroupPost.approve(groupPost.id);

    res.json({
      success: true,
      message: 'Post has been restored',
      data: {
        post_id: parseInt(postId)
      }
    });

  } catch (error) {
    console.error('Error restoring post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore post'
    });
  }
});

module.exports = router;
