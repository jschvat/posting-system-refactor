const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate: authenticateToken } = require('../../middleware/auth');
const { uploads, processImage, uploadConfig } = require('../../services/fileUploadService');
const Group = require('../../models/Group');
const GroupMembership = require('../../models/GroupMembership');
const db = require('../../config/database');

/**
 * @route   GET /api/groups/:slug/chat
 * @desc    Get group chat conversation
 * @access  Private (Members only)
 */
router.get('/:slug/chat', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findBySlug(slug);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is an active member
    const membership = await GroupMembership.findByGroupAndUser(group.id, req.user.id);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to access group chat'
      });
    }

    // Check if chat is enabled
    const chatEnabled = group.settings && group.settings.chat_enabled === true;
    if (!chatEnabled || !group.conversation_id) {
      return res.status(404).json({
        success: false,
        error: 'Group chat is not enabled'
      });
    }

    // Get conversation details
    const result = await db.query(`
      SELECT c.*,
        json_agg(
          json_build_object(
            'id', u.id,
            'username', u.username,
            'avatar_url', u.avatar_url
          )
        ) FILTER (WHERE cp.left_at IS NULL) as participants
      FROM conversations c
      LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [group.conversation_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const conversation = result.rows[0];

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    console.error('Error getting group chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group chat'
    });
  }
});

/**
 * @route   PUT /api/groups/:slug/chat/toggle
 * @desc    Enable or disable group chat
 * @access  Private (Admin only)
 */
router.put('/:slug/chat/toggle', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { enabled } = req.body;

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
        error: 'Only admins can modify chat settings'
      });
    }

    // Handle enabling chat
    if (enabled && !group.conversation_id) {
      // Create a new group conversation
      const conversationResult = await db.query(`
        INSERT INTO conversations (type, title, created_by, group_id, created_at, updated_at)
        VALUES ('group', $1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [`${group.display_name} Chat`, req.user.id, group.id]);

      const conversation = conversationResult.rows[0];

      // Update group with conversation_id
      await db.query(`
        UPDATE groups
        SET conversation_id = $1,
            settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{chat_enabled}', 'true'::jsonb),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [conversation.id, group.id]);

      // Add all active members to the conversation
      const members = await db.query(`
        SELECT user_id
        FROM group_memberships
        WHERE group_id = $1 AND status = 'active'
      `, [group.id]);

      for (const member of members.rows) {
        await db.query(`
          INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
          VALUES ($1, $2, 'member', CURRENT_TIMESTAMP)
          ON CONFLICT (conversation_id, user_id, left_at)
          WHERE left_at IS NULL
          DO NOTHING
        `, [conversation.id, member.user_id]);
      }

      // Get updated group
      const updatedGroup = await Group.findBySlug(slug);

      res.json({
        success: true,
        data: { group: updatedGroup },
        message: 'Group chat enabled successfully'
      });
    }
    // Handle disabling chat
    else if (!enabled && group.conversation_id) {
      // Update settings to disable chat
      await db.query(`
        UPDATE groups
        SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{chat_enabled}', 'false'::jsonb),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [group.id]);

      const updatedGroup = await Group.findBySlug(slug);

      res.json({
        success: true,
        data: { group: updatedGroup },
        message: 'Group chat disabled successfully'
      });
    }
    // Handle re-enabling chat
    else if (enabled && group.conversation_id) {
      await db.query(`
        UPDATE groups
        SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{chat_enabled}', 'true'::jsonb),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [group.id]);

      const updatedGroup = await Group.findBySlug(slug);

      res.json({
        success: true,
        data: { group: updatedGroup },
        message: 'Group chat re-enabled successfully'
      });
    } else {
      res.json({
        success: true,
        data: { group },
        message: 'No changes made'
      });
    }
  } catch (error) {
    console.error('Error toggling group chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle group chat'
    });
  }
});

/**
 * @route   PUT /api/groups/:slug
 * @desc    Update group
 * @access  Private (Admin only)
 */
router.put('/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
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
        error: 'Only admins can update group settings'
      });
    }

    const updatedGroup = await Group.update(group.id, req.body);

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update group'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/avatar
 * @desc    Upload group avatar
 * @access  Private (Admin only)
 */
router.post('/:slug/avatar', authenticateToken, uploads.groupAvatar.single('avatar'), async (req, res) => {
  try {
    const { slug } = req.params;
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
        error: 'Only admins can update group avatar'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Process and optimize image using centralized service
    const processedPath = await processImage(req.file.path, {
      width: 400,
      height: 400,
      fit: 'cover',
      quality: 85
    });

    // Update group avatar URL using centralized config
    const avatar_url = uploadConfig.getUrlPath('groupAvatars', path.basename(processedPath));
    const updatedGroup = await Group.update(group.id, { avatar_url });

    res.json({
      success: true,
      data: {
        group: updatedGroup,
        avatar_url
      }
    });
  } catch (error) {
    console.error('Error uploading group avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/banner
 * @desc    Upload group banner
 * @access  Private (Admin only)
 */
router.post('/:slug/banner', authenticateToken, uploads.groupBanner.single('banner'), async (req, res) => {
  try {
    const { slug } = req.params;
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
        error: 'Only admins can update group banner'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Process and optimize banner image using centralized service
    const processedPath = await processImage(req.file.path, {
      width: 1200,
      height: 400,
      fit: 'cover',
      quality: 85
    });

    // Update group banner URL using centralized config
    const banner_url = uploadConfig.getUrlPath('groupBanners', path.basename(processedPath));
    const updatedGroup = await Group.update(group.id, { banner_url });

    res.json({
      success: true,
      data: {
        group: updatedGroup,
        banner_url
      }
    });
  } catch (error) {
    console.error('Error uploading group banner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload banner'
    });
  }
});

/**
 * @route   DELETE /api/groups/:slug
 * @desc    Delete group
 * @access  Private (Admin only)
 */
router.delete('/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
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
        error: 'Only admins can delete groups'
      });
    }

    await Group.delete(group.id);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete group'
    });
  }
});

module.exports = router;
