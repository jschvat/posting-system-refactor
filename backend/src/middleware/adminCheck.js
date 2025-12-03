/**
 * Middleware to check if user has platform admin privileges
 * Supports multiple admin check strategies:
 * 1. Platform admin (is_admin flag or admin_users table)
 * 2. Group admin (admin in at least one group)
 */

const { query: dbQuery } = require('../config/database');

/**
 * Check if user is a platform-level admin
 * Checks: users.is_admin column, admin_users table, or fallback admin IDs
 */
async function checkPlatformAdmin(userId) {
  try {
    // Check if users table has is_admin column
    const columnCheck = await dbQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'is_admin'
      ) as exists
    `);

    if (columnCheck.rows[0].exists) {
      const userResult = await dbQuery(`
        SELECT is_admin FROM users WHERE id = $1
      `, [userId]);

      if (userResult.rows.length > 0 && userResult.rows[0].is_admin) {
        return true;
      }
    }

    // Check admin_users table if it exists
    const adminTableCheck = await dbQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'admin_users'
      ) as exists
    `);

    if (adminTableCheck.rows[0].exists) {
      const adminResult = await dbQuery(`
        SELECT id FROM admin_users
        WHERE user_id = $1 AND is_active = TRUE
      `, [userId]);

      if (adminResult.rows.length > 0) {
        return true;
      }
    }

    // Fallback: hardcoded admin IDs (user ID 1 is always admin)
    const FALLBACK_ADMIN_IDS = [1];
    return FALLBACK_ADMIN_IDS.includes(userId);

  } catch (error) {
    console.error('Error checking platform admin status:', error);
    // On error, fall back to hardcoded check
    return userId === 1;
  }
}

/**
 * Check if user is a group admin (admin in at least one group)
 */
async function checkGroupAdmin(userId) {
  try {
    const result = await dbQuery(
      `SELECT COUNT(*) as admin_count
       FROM group_memberships
       WHERE user_id = $1 AND role = 'admin' AND status = 'active'`,
      [userId]
    );
    return parseInt(result.rows[0].admin_count) > 0;
  } catch (error) {
    console.error('Error checking group admin status:', error);
    return false;
  }
}

/**
 * Require platform-level admin access
 * Use this for system-wide admin operations (marketplace permissions, etc.)
 */
const requirePlatformAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          type: 'UNAUTHORIZED'
        }
      });
    }

    const isAdmin = await checkPlatformAdmin(req.user.id);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Platform administrator access required',
          type: 'FORBIDDEN'
        }
      });
    }

    req.isPlatformAdmin = true;
    next();
  } catch (error) {
    console.error('Platform admin check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error checking admin permissions',
        type: 'SERVER_ERROR'
      }
    });
  }
};

/**
 * Require group-level admin access (original behavior)
 * Use this for group management operations
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          type: 'UNAUTHORIZED'
        }
      });
    }

    // Platform admins also have group admin privileges
    const isPlatformAdmin = await checkPlatformAdmin(req.user.id);
    if (isPlatformAdmin) {
      req.isPlatformAdmin = true;
      req.isGroupAdmin = true;
      return next();
    }

    // Check group admin status
    const isGroupAdmin = await checkGroupAdmin(req.user.id);

    if (!isGroupAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required. You must be an admin of at least one group.',
          type: 'FORBIDDEN'
        }
      });
    }

    req.isGroupAdmin = true;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error checking admin permissions',
        type: 'SERVER_ERROR'
      }
    });
  }
};

/**
 * Middleware to check admin OR self access
 * Allows users to access their own resources, or admins to access any
 */
const requireAdminOrSelf = (userIdParam = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            type: 'UNAUTHORIZED'
          }
        });
      }

      // Check if accessing own resource
      const targetUserId = parseInt(req.params[userIdParam] || req.body[userIdParam]);
      if (targetUserId === req.user.id) {
        req.isSelf = true;
        return next();
      }

      // Otherwise require platform admin
      const isAdmin = await checkPlatformAdmin(req.user.id);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied',
            type: 'FORBIDDEN'
          }
        });
      }

      req.isPlatformAdmin = true;
      next();
    } catch (error) {
      console.error('Admin or self check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Error checking permissions',
          type: 'SERVER_ERROR'
        }
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requirePlatformAdmin,
  requireAdminOrSelf,
  checkPlatformAdmin,
  checkGroupAdmin
};
