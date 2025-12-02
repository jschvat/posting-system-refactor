/**
 * Marketplace Permissions API Routes
 * Handles user access permissions to different marketplace types
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { query: dbQuery } = require('../config/database');

const router = express.Router();

/**
 * GET /api/marketplace-permissions/my-permissions
 * Get current user's marketplace permissions
 */
router.get('/my-permissions', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await dbQuery(`
      SELECT
        mt.id,
        mt.name,
        mt.slug,
        mt.description,
        mt.icon,
        mt.requires_permission,
        CASE
          WHEN mt.requires_permission = FALSE THEN TRUE
          WHEN ump.is_active = TRUE
            AND (ump.expires_at IS NULL OR ump.expires_at > NOW())
          THEN TRUE
          ELSE FALSE
        END as has_access,
        ump.granted_at,
        ump.expires_at,
        granter.username as granted_by_username
      FROM marketplace_types mt
      LEFT JOIN user_marketplace_permissions ump
        ON mt.id = ump.marketplace_type_id
        AND ump.user_id = $1
        AND ump.is_active = TRUE
      LEFT JOIN users granter ON ump.granted_by = granter.id
      WHERE mt.is_active = TRUE
      ORDER BY mt.name
    `, [userId]);

    res.json({
      success: true,
      data: {
        marketplaces: result.rows,
        accessible_marketplaces: result.rows.filter(m => m.has_access)
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace permissions:', error);
    next(error);
  }
});

/**
 * GET /api/marketplace-permissions/check/:slug
 * Check if current user has access to a specific marketplace
 */
router.get('/check/:slug',
  authenticate,
  [
    param('slug').trim().notEmpty().withMessage('Marketplace slug is required'),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { slug } = req.params;

      const result = await dbQuery(`
        SELECT has_marketplace_access($1, $2) as has_access
      `, [userId, slug]);

      const hasAccess = result.rows[0]?.has_access || false;

      res.json({
        success: true,
        data: {
          slug,
          has_access: hasAccess
        }
      });
    } catch (error) {
      console.error('Error checking marketplace access:', error);
      next(error);
    }
  }
);

/**
 * GET /api/marketplace-permissions/marketplace-types
 * Get all marketplace types (public endpoint for admins)
 */
router.get('/marketplace-types', authenticate, async (req, res, next) => {
  try {
    const result = await dbQuery(`
      SELECT
        id,
        name,
        slug,
        description,
        icon,
        requires_permission,
        is_active,
        created_at
      FROM marketplace_types
      ORDER BY name
    `);

    res.json({
      success: true,
      data: {
        marketplace_types: result.rows
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace types:', error);
    next(error);
  }
});

/**
 * POST /api/marketplace-permissions/grant
 * Grant marketplace access to a user (admin only)
 * TODO: Add admin check middleware
 */
router.post('/grant',
  authenticate,
  [
    body('user_id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('marketplace_slug').trim().notEmpty().withMessage('Marketplace slug is required'),
    body('expires_at').optional().isISO8601().withMessage('Expiration must be a valid date'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const grantedBy = req.user.id;
      const { user_id, marketplace_slug, expires_at, notes } = req.body;

      // Check if admin (basic check - enhance this later with proper admin middleware)
      // For now, only user_id 1 (or users in admin table) can grant permissions
      const adminCheck = await dbQuery(`
        SELECT id FROM users WHERE id = $1 AND id = 1
      `, [grantedBy]);

      if (adminCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can grant marketplace permissions',
            type: 'FORBIDDEN'
          }
        });
      }

      // Get marketplace type ID
      const marketplaceResult = await dbQuery(`
        SELECT id FROM marketplace_types
        WHERE slug = $1 AND is_active = TRUE
      `, [marketplace_slug]);

      if (marketplaceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Marketplace type not found',
            type: 'NOT_FOUND'
          }
        });
      }

      const marketplaceTypeId = marketplaceResult.rows[0].id;

      // Insert or update permission
      const result = await dbQuery(`
        INSERT INTO user_marketplace_permissions
          (user_id, marketplace_type_id, granted_by, expires_at, notes, is_active)
        VALUES ($1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (user_id, marketplace_type_id)
        DO UPDATE SET
          granted_by = EXCLUDED.granted_by,
          expires_at = EXCLUDED.expires_at,
          notes = EXCLUDED.notes,
          is_active = TRUE,
          granted_at = CURRENT_TIMESTAMP
        RETURNING id, user_id, marketplace_type_id, granted_at, expires_at
      `, [user_id, marketplaceTypeId, grantedBy, expires_at || null, notes || null]);

      res.status(201).json({
        success: true,
        data: {
          permission: result.rows[0],
          message: 'Marketplace access granted successfully'
        }
      });
    } catch (error) {
      console.error('Error granting marketplace permission:', error);
      next(error);
    }
  }
);

/**
 * DELETE /api/marketplace-permissions/revoke
 * Revoke marketplace access from a user (admin only)
 */
router.delete('/revoke',
  authenticate,
  [
    body('user_id').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('marketplace_slug').trim().notEmpty().withMessage('Marketplace slug is required'),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const revokedBy = req.user.id;
      const { user_id, marketplace_slug } = req.body;

      // Check if admin
      const adminCheck = await dbQuery(`
        SELECT id FROM users WHERE id = $1 AND id = 1
      `, [revokedBy]);

      if (adminCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can revoke marketplace permissions',
            type: 'FORBIDDEN'
          }
        });
      }

      // Get marketplace type ID
      const marketplaceResult = await dbQuery(`
        SELECT id FROM marketplace_types
        WHERE slug = $1
      `, [marketplace_slug]);

      if (marketplaceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Marketplace type not found',
            type: 'NOT_FOUND'
          }
        });
      }

      const marketplaceTypeId = marketplaceResult.rows[0].id;

      // Revoke permission (soft delete)
      const result = await dbQuery(`
        UPDATE user_marketplace_permissions
        SET is_active = FALSE
        WHERE user_id = $1 AND marketplace_type_id = $2
        RETURNING id
      `, [user_id, marketplaceTypeId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Permission not found',
            type: 'NOT_FOUND'
          }
        });
      }

      res.json({
        success: true,
        data: {
          message: 'Marketplace access revoked successfully'
        }
      });
    } catch (error) {
      console.error('Error revoking marketplace permission:', error);
      next(error);
    }
  }
);

/**
 * GET /api/marketplace-permissions/all-permissions
 * Get all users with their marketplace permissions (admin only)
 */
router.get('/all-permissions',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('marketplace').optional().trim(),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const requesterId = req.user.id;

      // Check if admin
      if (requesterId !== 1) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can view all permissions',
            type: 'FORBIDDEN'
          }
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const marketplaceFilter = req.query.marketplace || '';

      // Build query with optional filters
      let whereClause = 'WHERE ump.is_active = TRUE';
      const params = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereClause += ` AND (u.username ILIKE $${paramCount} OR u.display_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      if (marketplaceFilter) {
        paramCount++;
        whereClause += ` AND mt.slug = $${paramCount}`;
        params.push(marketplaceFilter);
      }

      // Get total count
      const countResult = await dbQuery(`
        SELECT COUNT(DISTINCT ump.id) as total
        FROM user_marketplace_permissions ump
        JOIN users u ON ump.user_id = u.id
        JOIN marketplace_types mt ON ump.marketplace_type_id = mt.id
        ${whereClause}
      `, params);

      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      params.push(limit, offset);
      const result = await dbQuery(`
        SELECT
          ump.id as permission_id,
          u.id as user_id,
          u.username,
          u.display_name,
          u.email,
          u.avatar_url,
          mt.id as marketplace_id,
          mt.name as marketplace_name,
          mt.slug as marketplace_slug,
          mt.icon as marketplace_icon,
          ump.granted_at,
          ump.expires_at,
          ump.notes,
          granter.username as granted_by_username
        FROM user_marketplace_permissions ump
        JOIN users u ON ump.user_id = u.id
        JOIN marketplace_types mt ON ump.marketplace_type_id = mt.id
        LEFT JOIN users granter ON ump.granted_by = granter.id
        ${whereClause}
        ORDER BY ump.granted_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `, params);

      res.json({
        success: true,
        data: {
          permissions: result.rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching all permissions:', error);
      next(error);
    }
  }
);

/**
 * GET /api/marketplace-permissions/search-users
 * Search users for granting permissions (admin only)
 */
router.get('/search-users',
  authenticate,
  [
    query('q').trim().notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const requesterId = req.user.id;

      // Check if admin
      if (requesterId !== 1) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only administrators can search users',
            type: 'FORBIDDEN'
          }
        });
      }

      const searchQuery = req.query.q;
      const limit = parseInt(req.query.limit) || 10;

      const result = await dbQuery(`
        SELECT
          id,
          username,
          display_name,
          email,
          avatar_url
        FROM users
        WHERE
          username ILIKE $1
          OR display_name ILIKE $1
          OR email ILIKE $1
        ORDER BY username
        LIMIT $2
      `, [`%${searchQuery}%`, limit]);

      res.json({
        success: true,
        data: {
          users: result.rows
        }
      });
    } catch (error) {
      console.error('Error searching users:', error);
      next(error);
    }
  }
);

/**
 * GET /api/marketplace-permissions/users/:userId
 * Get marketplace permissions for a specific user (admin only)
 */
router.get('/users/:userId',
  authenticate,
  [
    param('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    handleValidationErrors
  ],
  async (req, res, next) => {
    try {
      const requesterId = req.user.id;
      const { userId } = req.params;

      // Check if admin or requesting own permissions
      const isAdmin = requesterId === 1; // Basic admin check
      if (!isAdmin && requesterId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
            type: 'FORBIDDEN'
          }
        });
      }

      const result = await dbQuery(`
        SELECT
          mt.id,
          mt.name,
          mt.slug,
          mt.description,
          mt.icon,
          mt.requires_permission,
          ump.is_active,
          ump.granted_at,
          ump.expires_at,
          ump.notes,
          granter.username as granted_by_username
        FROM marketplace_types mt
        LEFT JOIN user_marketplace_permissions ump
          ON mt.id = ump.marketplace_type_id
          AND ump.user_id = $1
        LEFT JOIN users granter ON ump.granted_by = granter.id
        WHERE mt.is_active = TRUE
        ORDER BY mt.name
      `, [userId]);

      res.json({
        success: true,
        data: {
          user_id: parseInt(userId),
          permissions: result.rows
        }
      });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      next(error);
    }
  }
);

module.exports = router;
