/**
 * Centralized permission checking utilities
 * Provides consistent permission checks across the application
 */

const GroupMembership = require('../models/GroupMembership');

/**
 * Check if a user can moderate a group based on their role and group settings
 *
 * @param {object} group - The group object with permission settings
 * @param {number} userId - The user ID to check permissions for
 * @param {string} permission - The specific permission to check (e.g., 'moderator_can_remove_posts')
 * @returns {Promise<boolean>} True if user has permission, false otherwise
 *
 * Permission hierarchy:
 * - Admins always have all permissions
 * - Moderators have permissions if the group's permission flag is true
 * - Regular members and non-members have no moderation permissions
 */
async function canModerate(group, userId, permission) {
  const membership = await GroupMembership.findByGroupAndUser(group.id, userId);

  // User must be an active member
  if (!membership || membership.status !== 'active') {
    return false;
  }

  // Admins can always perform any action
  if (membership.role === 'admin') {
    return true;
  }

  // Check if user is moderator and if group allows this permission
  if (membership.role === 'moderator') {
    return group[permission] === true;
  }

  return false;
}

/**
 * Check if a user is an admin of a group
 *
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to check
 * @returns {Promise<boolean>} True if user is an admin
 */
async function isGroupAdmin(groupId, userId) {
  const membership = await GroupMembership.findByGroupAndUser(groupId, userId);
  return membership?.role === 'admin' && membership?.status === 'active';
}

/**
 * Check if a user is a moderator or admin of a group
 *
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to check
 * @returns {Promise<boolean>} True if user is a moderator or admin
 */
async function isGroupModerator(groupId, userId) {
  const membership = await GroupMembership.findByGroupAndUser(groupId, userId);
  return (
    membership?.status === 'active' &&
    (membership?.role === 'moderator' || membership?.role === 'admin')
  );
}

/**
 * Check if a user is an active member of a group
 *
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to check
 * @returns {Promise<boolean>} True if user is an active member
 */
async function isGroupMember(groupId, userId) {
  const membership = await GroupMembership.findByGroupAndUser(groupId, userId);
  return membership?.status === 'active';
}

/**
 * Get a user's role in a group
 *
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to check
 * @returns {Promise<string|null>} The user's role ('admin', 'moderator', 'member') or null if not a member
 */
async function getGroupRole(groupId, userId) {
  const membership = await GroupMembership.findByGroupAndUser(groupId, userId);
  if (!membership || membership.status !== 'active') {
    return null;
  }
  return membership.role;
}

/**
 * Check if a user can perform an action on content (post, comment, etc.)
 * Users can modify their own content OR moderate if they have permission
 *
 * @param {number} contentOwnerId - The ID of the user who owns the content
 * @param {number} currentUserId - The ID of the current user
 * @param {object} group - The group object (optional, for moderation checks)
 * @param {string} moderationPermission - The moderation permission to check (optional)
 * @returns {Promise<boolean>} True if user can perform the action
 */
async function canModifyContent(contentOwnerId, currentUserId, group = null, moderationPermission = null) {
  // Users can always modify their own content
  if (contentOwnerId === currentUserId) {
    return true;
  }

  // Check moderation permissions if group and permission are provided
  if (group && moderationPermission) {
    return await canModerate(group, currentUserId, moderationPermission);
  }

  return false;
}

/**
 * Check if a user can delete content (post, comment, etc.)
 * Checks both ownership and moderation permissions
 *
 * @param {number} contentOwnerId - The ID of the user who owns the content
 * @param {number} currentUserId - The ID of the current user
 * @param {object} group - The group object (for moderation checks)
 * @param {string} deletePermission - The delete permission to check (e.g., 'moderator_can_remove_posts')
 * @returns {Promise<boolean>} True if user can delete the content
 */
async function canDeleteContent(contentOwnerId, currentUserId, group, deletePermission) {
  return await canModifyContent(contentOwnerId, currentUserId, group, deletePermission);
}

/**
 * Middleware to check if user is a group admin
 * Returns 403 if not an admin
 *
 * @param {string} groupIdParam - The request parameter name containing the group ID (default: 'groupId')
 * @returns {Function} Express middleware function
 */
function requireGroupAdmin(groupIdParam = 'groupId') {
  return async (req, res, next) => {
    try {
      const groupId = parseInt(req.params[groupIdParam]);
      const userId = req.user.id;

      const isAdmin = await isGroupAdmin(groupId, userId);

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only group admins can perform this action',
            type: 'PERMISSION_DENIED'
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user is a group moderator or admin
 * Returns 403 if not a moderator or admin
 *
 * @param {string} groupIdParam - The request parameter name containing the group ID (default: 'groupId')
 * @returns {Function} Express middleware function
 */
function requireGroupModerator(groupIdParam = 'groupId') {
  return async (req, res, next) => {
    try {
      const groupId = parseInt(req.params[groupIdParam]);
      const userId = req.user.id;

      const isMod = await isGroupModerator(groupId, userId);

      if (!isMod) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only group moderators and admins can perform this action',
            type: 'PERMISSION_DENIED'
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check if user is a group member
 * Returns 403 if not a member
 *
 * @param {string} groupIdParam - The request parameter name containing the group ID (default: 'groupId')
 * @returns {Function} Express middleware function
 */
function requireGroupMember(groupIdParam = 'groupId') {
  return async (req, res, next) => {
    try {
      const groupId = parseInt(req.params[groupIdParam]);
      const userId = req.user.id;

      const isMember = await isGroupMember(groupId, userId);

      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only group members can perform this action',
            type: 'PERMISSION_DENIED'
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  canModerate,
  isGroupAdmin,
  isGroupModerator,
  isGroupMember,
  getGroupRole,
  canModifyContent,
  canDeleteContent,
  requireGroupAdmin,
  requireGroupModerator,
  requireGroupMember
};
