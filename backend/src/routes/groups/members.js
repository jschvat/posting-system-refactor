const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, optionalAuthenticate: optionalAuth } = require('../../middleware/auth');
const { validateUserLocation } = require('../../utils/geolocation');
const Group = require('../../models/Group');
const GroupMembership = require('../../models/GroupMembership');
const User = require('../../models/User');

/**
 * @route   GET /api/groups/:slug/members
 * @desc    Get group members
 * @access  Public (for public groups) / Members only (for private groups)
 */
router.get('/:slug/members', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { status = 'active', role, limit = 50, offset = 0 } = req.query;

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
          error: 'Only members can view member list'
        });
      }
    }

    const result = await GroupMembership.getGroupMembers(group.id, {
      status,
      role,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting group members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group members'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/membership
 * @desc    Check current user's membership status in a group
 * @access  Private
 */
router.get('/:slug/membership', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findBySlug(slug);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const membership = await GroupMembership.findByGroupAndUser(group.id, req.user.id);

    if (!membership) {
      return res.json({
        success: true,
        data: {
          is_member: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        is_member: true,
        membership: {
          role: membership.role,
          status: membership.status,
          joined_at: membership.joined_at
        }
      }
    });
  } catch (error) {
    console.error('Error checking membership:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check membership status'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/join
 * @desc    Join a group
 * @access  Private
 */
router.post('/:slug/join', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findBySlug(slug);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if already a member
    const existingMembership = await GroupMembership.findByGroupAndUser(group.id, req.user.id);
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'Already a member of this group'
      });
    }

    // Check location restrictions
    if (group.location_restricted) {
      const user = await User.findById(req.user.id);

      // Construct location object from individual columns
      const userLocation = {
        latitude: user.location_latitude,
        longitude: user.location_longitude,
        city: user.location_city,
        state: user.location_state,
        country: user.location_country,
        sharing: user.location_sharing
      };

      const locationCheck = validateUserLocation(userLocation, group);
      if (!locationCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: locationCheck.reason
        });
      }
    }

    // Check group settings
    let status = 'active';
    if (group.visibility === 'invite_only') {
      return res.status(403).json({
        success: false,
        error: 'This group is invite-only'
      });
    }
    if (group.require_approval) {
      status = 'pending';
    }

    const membership = await GroupMembership.create({
      group_id: group.id,
      user_id: req.user.id,
      role: 'member',
      status
    });

    res.status(201).json({
      success: true,
      data: membership,
      message: status === 'pending' ? 'Membership pending approval' : 'Successfully joined group'
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/leave
 * @desc    Leave a group
 * @access  Private
 */
router.post('/:slug/leave', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findBySlug(slug);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator_id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Group creator cannot leave. Transfer ownership or delete the group.'
      });
    }

    // Check if user is a member
    const isMember = await GroupMembership.isMember(group.id, req.user.id);
    if (!isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    await GroupMembership.delete(group.id, req.user.id);

    res.json({
      success: true,
      message: 'Successfully left group'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave group'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/members/:userId/role
 * @desc    Update member role
 * @access  Private (Admin only)
 */
router.post('/:slug/members/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const { role } = req.body;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is admin
    const isAdmin = await GroupMembership.isAdmin(group.id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can change member roles'
      });
    }

    const updatedMembership = await GroupMembership.update(group.id, parseInt(userId), { role });

    res.json({
      success: true,
      data: updatedMembership
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member role'
    });
  }
});

module.exports = router;
