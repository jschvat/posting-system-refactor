const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken } = require('../../middleware/auth');
const { canModerate } = require('../../utils/permissions');
const Group = require('../../models/Group');
const GroupMembership = require('../../models/GroupMembership');
const db = require('../../config/database');

/**
 * @route   POST /api/groups/:slug/members/:userId/ban
 * @desc    Ban a member
 * @access  Private (Moderator/Admin only)
 */
router.post('/:slug/members/:userId/ban', authenticateToken, async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const { banned_reason } = req.body;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user has permission to ban members
    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_ban_members');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to ban members'
      });
    }

    const updatedMembership = await GroupMembership.ban(
      group.id,
      parseInt(userId),
      req.user.id,
      banned_reason
    );

    res.json({
      success: true,
      data: updatedMembership
    });
  } catch (error) {
    console.error('Error banning member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban member'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/members/:userId/unban
 * @desc    Unban a member
 * @access  Private (Moderator/Admin only)
 */
router.post('/:slug/members/:userId/unban', authenticateToken, async (req, res) => {
  try {
    const { slug, userId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user has permission to ban/unban members
    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_ban_members');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to unban members'
      });
    }

    const updatedMembership = await GroupMembership.unban(group.id, parseInt(userId));

    res.json({
      success: true,
      data: updatedMembership
    });
  } catch (error) {
    console.error('Error unbanning member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban member'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/members/pending
 * @desc    Get pending membership requests
 * @access  Private (Moderators/Admins only)
 */
router.get('/:slug/members/pending', authenticateToken, async (req, res) => {
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
        error: 'Only moderators and admins can view pending membership requests'
      });
    }

    const members = await GroupMembership.getPendingRequests(group.id);

    res.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    console.error('Error getting pending members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending members'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/members/:userId/approve
 * @desc    Approve a pending membership request
 * @access  Private (Moderators/Admins only)
 */
router.post('/:slug/members/:userId/approve', authenticateToken, async (req, res) => {
  try {
    const { slug, userId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user has permission to approve members
    const hasPermission = await canModerate(group, req.user.id, 'moderator_can_approve_members');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to approve membership requests'
      });
    }

    const membership = await GroupMembership.approve(group.id, parseInt(userId));

    res.json({
      success: true,
      data: membership,
      message: 'Membership approved successfully'
    });
  } catch (error) {
    console.error('Error approving membership:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve membership'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/members/:userId/reject
 * @desc    Reject a pending membership request
 * @access  Private (Moderators/Admins only)
 */
router.post('/:slug/members/:userId/reject', authenticateToken, async (req, res) => {
  try {
    const { slug, userId } = req.params;

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
        error: 'Only moderators and admins can reject membership requests'
      });
    }

    await GroupMembership.reject(group.id, parseInt(userId));

    res.json({
      success: true,
      message: 'Membership rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting membership:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject membership'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/activity
 * @desc    Get group activity log
 * @access  Private (Moderators/Admins only)
 */
router.get('/:slug/activity', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 50, offset = 0 } = req.query;

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
        error: 'Only moderators and admins can view activity log'
      });
    }

    // Query activity log
    const queryText = `
      SELECT
        ga.*,
        u.username as moderator_username,
        u.first_name,
        u.last_name,
        t.username as target_username
      FROM group_activity_log ga
      LEFT JOIN users u ON ga.user_id = u.id
      LEFT JOIN users t ON ga.target_id = t.id AND ga.target_type = 'user'
      WHERE ga.group_id = $1
      ORDER BY ga.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(queryText, [group.id, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: {
        activities: result.rows,
        total: result.rowCount
      }
    });
  } catch (error) {
    console.error('Error getting activity log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get activity log'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/members/banned
 * @desc    Get banned members list
 * @access  Private (Moderators/Admins only)
 */
router.get('/:slug/members/banned', authenticateToken, async (req, res) => {
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
        error: 'Only moderators and admins can view banned members'
      });
    }

    const members = await GroupMembership.getBannedUsers(group.id);

    res.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    console.error('Error getting banned members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get banned members'
    });
  }
});

module.exports = router;
