const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken } = require('../../middleware/auth');
const Group = require('../../models/Group');
const GroupMembership = require('../../models/GroupMembership');
const GroupVote = require('../../models/GroupVote');

/**
 * @route   POST /api/groups/:slug/posts/:postId/vote
 * @desc    Vote on a post
 * @access  Private (Members only)
 */
router.post('/:slug/posts/:postId/vote', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member (unless group allows public posting)
    if (!group.allow_public_posting) {
      const isMember = await GroupMembership.isMember(group.id, req.user.id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'You must be a member to vote'
        });
      }
    }

    const vote = await GroupVote.toggleVote({
      user_id: req.user.id,
      post_id: parseInt(postId),
      vote_type
    });

    // Get updated vote counts
    const voteCounts = await GroupVote.getPostVotes(parseInt(postId));

    res.json({
      success: true,
      data: {
        vote,
        counts: voteCounts
      },
      message: vote ? 'Vote recorded' : 'Vote removed'
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to vote on post'
    });
  }
});

/**
 * @route   DELETE /api/groups/:slug/posts/:postId/vote
 * @desc    Remove vote from a post
 * @access  Private
 */
router.delete('/:slug/posts/:postId/vote', authenticateToken, async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const group = await Group.findBySlug(slug);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    await GroupVote.unvote({
      user_id: req.user.id,
      post_id: parseInt(postId)
    });

    // Get updated vote counts
    const voteCounts = await GroupVote.getPostVotes(parseInt(postId));

    res.json({
      success: true,
      data: {
        counts: voteCounts
      },
      message: 'Vote removed'
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove vote'
    });
  }
});

module.exports = router;
