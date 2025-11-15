const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, optionalAuthenticate: optionalAuth } = require('../../middleware/auth');
const Group = require('../../models/Group');
const GroupPost = require('../../models/GroupPost');
const GroupMembership = require('../../models/GroupMembership');
const User = require('../../models/User');
const { validateUserLocation } = require('../../utils/geolocation');

/**
 * @route   GET /api/groups/:slug/posts
 * @desc    Get posts in a group
 * @access  Public (for public groups) / Members only (for private groups)
 */
router.get('/:slug/posts', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const { sort_by = 'hot', limit = 20, offset = 0 } = req.query;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check visibility and membership
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

    const result = await GroupPost.getGroupPosts(group.id, {
      status: 'published',
      user_id: req.user?.userId,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sort_by
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting group posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group posts'
    });
  }
});

/**
 * @route   POST /api/groups/:slug/posts
 * @desc    Create a post in a group
 * @access  Private (Members only)
 */
router.post('/:slug/posts', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      title,
      content,
      post_type = 'text',
      link_url,
      link_title,
      link_description,
      link_thumbnail,
      is_nsfw = false,
      is_spoiler = false,
      poll_question,
      poll_options,
      poll_ends_at,
      poll_allow_multiple = false
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Validate poll-specific requirements
    if (post_type === 'poll') {
      if (!poll_question) {
        return res.status(400).json({
          success: false,
          error: 'Poll question is required for poll posts'
        });
      }

      if (!poll_options || !Array.isArray(poll_options) || poll_options.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 poll options are required'
        });
      }

      if (poll_options.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 10 poll options allowed'
        });
      }
    }

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member (unless group allows public posting)
    const membership = await GroupMembership.findByGroupAndUser(group.id, req.user.id);
    if (!group.allow_public_posting && (!membership || membership.status !== 'active')) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to post in this group'
      });
    }

    // Check location restrictions (for both members and non-members in public posting groups)
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

    // Check if posts are allowed
    if (!group.allow_posts) {
      return res.status(403).json({
        success: false,
        error: 'Posting is disabled in this group'
      });
    }

    // Determine post status based on group settings
    let status = 'published';
    if (group.post_approval_required && membership.role === 'member') {
      status = 'pending';
    }

    const post = await GroupPost.create({
      group_id: group.id,
      user_id: req.user.id,
      title,
      content,
      post_type,
      link_url,
      link_title,
      link_description,
      link_thumbnail,
      status,
      is_nsfw,
      is_spoiler,
      poll_question: post_type === 'poll' ? poll_question : null,
      poll_ends_at: post_type === 'poll' ? poll_ends_at : null,
      poll_allow_multiple: post_type === 'poll' ? poll_allow_multiple : false
    });

    // If it's a poll, create the poll options
    if (post_type === 'poll' && poll_options) {
      const PollOption = require('../../models/PollOption');
      await PollOption.createMultiple(post.id, poll_options);
    }

    res.status(201).json({
      success: true,
      data: post,
      message: status === 'pending' ? 'Post pending moderator approval' : 'Post created successfully'
    });
  } catch (error) {
    console.error('Error creating group post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

/**
 * @route   GET /api/groups/:slug/posts/:postId
 * @desc    Get a single post with details
 * @access  Public (for public groups) / Members only (for private groups)
 */
router.get('/:slug/posts/:postId', optionalAuth, async (req, res) => {
  try {
    const { slug, postId } = req.params;

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

    const post = await GroupPost.getWithMedia(parseInt(postId), req.user?.userId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error getting group post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get post'
    });
  }
});

/**
 * @route   PUT /api/groups/:slug/posts/:postId
 * @desc    Update a post
 * @access  Private (Author or Moderator)
 */
router.put('/:slug/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const { title, content, is_nsfw, is_spoiler } = req.body;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const post = await GroupPost.findById(parseInt(postId));
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check permissions: author or moderator
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    const isAuthor = post.user_id === req.user.id;

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only the author or moderators can edit this post'
      });
    }

    const updatedPost = await GroupPost.update(parseInt(postId), {
      title,
      content,
      is_nsfw,
      is_spoiler
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Error updating group post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
});

/**
 * @route   DELETE /api/groups/:slug/posts/:postId
 * @desc    Delete a post
 * @access  Private (Author or Moderator)
 */
router.delete('/:slug/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const post = await GroupPost.findById(parseInt(postId));
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check permissions
    const isModerator = await GroupMembership.isModerator(group.id, req.user.id);
    const isAuthor = post.user_id === req.user.id;

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        error: 'Only the author or moderators can delete this post'
      });
    }

    await GroupPost.delete(parseInt(postId));

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

module.exports = router;
