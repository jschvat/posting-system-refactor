const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, optionalAuthenticate: optionalAuth } = require('../../middleware/auth');
const { transformGroupWithFullUrls } = require('../../utils/urlHelpers');
const {
  buildPagination,
  buildOrderBy,
  sanitizeSortDirection,
  sanitizeSortColumn
} = require('../../utils/queryHelpers');
const Group = require('../../models/Group');
const GroupMembership = require('../../models/GroupMembership');
const User = require('../../models/User');
const { validateUserLocation } = require('../../utils/geolocation');

/**
 * @route   GET /api/groups
 * @desc    List groups with pagination and filters
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      visibility,
      creator_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Build pagination using helper
    const pagination = buildPagination(req.query.limit || 20, req.query.page || 1);

    const result = await Group.list({
      limit: pagination.limit,
      offset: pagination.offset,
      visibility,
      creator_id: creator_id ? parseInt(creator_id) : null,
      search,
      sort_by,
      sort_order
    });

    // If user is authenticated, add membership info
    let transformedGroups = result.groups.map(transformGroupWithFullUrls);

    if (req.user) {
      const db = require('../../config/database');
      const membershipResult = await db.query(
        'SELECT group_id, status, role FROM group_memberships WHERE user_id = $1',
        [req.user.id]
      );
      const membershipMap = new Map();
      membershipResult.rows.forEach(m => {
        membershipMap.set(m.group_id, { status: m.status, role: m.role });
      });

      transformedGroups = transformedGroups.map(g => {
        const membership = membershipMap.get(g.id);
        if (membership) {
          g.user_membership = {
            status: membership.status,
            role: membership.role
          };
        }
        return g;
      });
    }

    // Transform groups with full URLs
    const transformedResult = {
      ...result,
      groups: transformedGroups
    };

    res.json({
      success: true,
      data: transformedResult
    });
  } catch (error) {
    console.error('Error listing groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list groups'
    });
  }
});

/**
 * @route   GET /api/groups/popular
 * @desc    Get popular groups
 * @access  Public
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const groups = await Group.getPopular(parseInt(limit));

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error getting popular groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular groups'
    });
  }
});

/**
 * @route   GET /api/groups/recent
 * @desc    Get recently created groups
 * @access  Public
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const groups = await Group.getRecent(parseInt(limit));

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error getting recent groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent groups'
    });
  }
});

/**
 * @route   GET /api/groups/filtered
 * @desc    Get groups filtered by user's membership/location status
 * @access  Private
 * @query   filter: 'all' | 'joined' | 'pending' | 'available' | 'unavailable'
 */
router.get('/filtered', authenticateToken, async (req, res) => {
  try {
    const { filter = 'all', limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    // Get user's location for geolocation checks
    const user = await User.findById(userId);
    const userLocation = {
      latitude: user.location_latitude,
      longitude: user.location_longitude,
      city: user.location_city,
      state: user.location_state,
      country: user.location_country,
      sharing: user.location_sharing
    };

    // Get all groups
    const allGroups = await Group.list({
      limit: 1000, // Get all for filtering
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'DESC'
    });

    // Get user's memberships using direct query
    const db = require('../../config/database');
    const membershipResult = await db.query(
      'SELECT group_id, status, role FROM group_memberships WHERE user_id = $1',
      [userId]
    );
    const membershipMap = new Map();
    membershipResult.rows.forEach(m => {
      membershipMap.set(m.group_id, { status: m.status, role: m.role });
    });

    // Filter groups based on filter type
    let filteredGroups = allGroups.groups || [];

    if (filter === 'joined') {
      // Only groups user is an active member of
      filteredGroups = filteredGroups.filter(g => {
        const membership = membershipMap.get(g.id);
        return membership?.status === 'active';
      });
    } else if (filter === 'pending') {
      // Only groups with pending membership
      filteredGroups = filteredGroups.filter(g => {
        const membership = membershipMap.get(g.id);
        return membership?.status === 'pending';
      });
    } else if (filter === 'available') {
      // Groups user can join (not joined, not pending, location allows)
      filteredGroups = filteredGroups.filter(g => {
        const membership = membershipMap.get(g.id);
        if (membership?.status === 'active' || membership?.status === 'pending') return false;

        if (g.location_restricted) {
          const locationCheck = validateUserLocation(userLocation, g);
          return locationCheck.allowed;
        }
        return true;
      });
    } else if (filter === 'unavailable') {
      // Groups user can't join due to location restrictions
      filteredGroups = filteredGroups.filter(g => {
        const membership = membershipMap.get(g.id);
        if (membership?.status === 'active' || membership?.status === 'pending') return false;

        if (g.location_restricted) {
          const locationCheck = validateUserLocation(userLocation, g);
          return !locationCheck.allowed;
        }
        return false;
      });
    }
    // 'all' shows everything

    // Apply pagination to filtered results
    const total = filteredGroups.length;
    const paginatedGroups = filteredGroups.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // Transform groups with full URLs and membership info
    const transformedGroups = paginatedGroups.map(g => {
      const transformed = transformGroupWithFullUrls(g);
      const membership = membershipMap.get(g.id);
      if (membership) {
        transformed.user_membership = {
          status: membership.status,
          role: membership.role
        };
      }
      return transformed;
    });

    res.json({
      success: true,
      data: {
        groups: transformedGroups,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error filtering groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter groups'
    });
  }
});

/**
 * @route   GET /api/groups/search
 * @desc    Search groups by name or description
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const groups = await Group.search(q, parseInt(limit), parseInt(offset));

    // Transform groups with full URLs
    const transformedGroups = groups.map(transformGroupWithFullUrls);

    res.json({
      success: true,
      data: {
        groups: transformedGroups,
        total: transformedGroups.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search groups'
    });
  }
});

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      display_name,
      description,
      avatar_url,
      banner_url,
      visibility = 'public',
      require_approval = false,
      post_approval_required = false,
      allow_multimedia = true,
      allowed_media_types = ['image', 'video', 'pdf', 'model', 'link'],
      max_file_size_mb = 50
    } = req.body;

    // Validation
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        error: 'Name and display name are required'
      });
    }

    // Check if name is available
    const existingGroup = await Group.findByName(name);
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        error: 'Group name already exists'
      });
    }

    // Generate slug
    const slug = await Group.generateSlug(name);

    // Create group
    const group = await Group.create({
      name,
      slug,
      display_name,
      description,
      avatar_url,
      banner_url,
      visibility,
      require_approval,
      post_approval_required,
      allow_multimedia,
      allowed_media_types,
      max_file_size_mb,
      creator_id: req.user.id
    });

    // Add creator as admin
    await GroupMembership.create({
      group_id: group.id,
      user_id: req.user.id,
      role: 'admin',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group'
    });
  }
});

/**
 * @route   GET /api/groups/:slug
 * @desc    Get group by slug
 * @access  Public
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await Group.findBySlug(slug);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member (if authenticated)
    let membership = null;
    if (req.user) {
      membership = await GroupMembership.getUserRole(group.id, req.user.id);
    }

    // Check visibility
    if (group.visibility === 'private' && (!membership || membership.status !== 'active')) {
      return res.status(403).json({
        success: false,
        error: 'This group is private'
      });
    }

    // Get group with creator info
    const groupWithCreator = await Group.getWithCreator(group.id);

    // Transform URLs to full paths
    const transformedGroup = transformGroupWithFullUrls(groupWithCreator);

    res.json({
      success: true,
      data: {
        ...transformedGroup,
        user_role: membership?.role || null,
        user_status: membership?.status || null
      }
    });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group'
    });
  }
});

module.exports = router;
