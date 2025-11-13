/**
 * Database query helper utilities
 * Provides reusable SQL query patterns and pagination logic
 */

/**
 * Build a standard user data SELECT clause with joins
 * Includes username, names, avatar from users table
 *
 * @param {string} userAlias - Alias for users table (default: 'u')
 * @returns {string} SQL SELECT clause for user data
 */
const userDataSelect = (userAlias = 'u') => {
  return `
    ${userAlias}.id as user_id,
    ${userAlias}.username,
    ${userAlias}.first_name,
    ${userAlias}.last_name,
    ${userAlias}.avatar_url
  `;
};

/**
 * Build a standard user JOIN clause
 *
 * @param {string} fromTable - Table to join from
 * @param {string} fromColumn - Column in from table (default: 'user_id')
 * @param {string} userAlias - Alias for users table (default: 'u')
 * @returns {string} SQL JOIN clause
 */
const userJoin = (fromTable, fromColumn = 'user_id', userAlias = 'u') => {
  return `LEFT JOIN users ${userAlias} ON ${fromTable}.${fromColumn} = ${userAlias}.id`;
};

/**
 * Build reaction count aggregation for posts or comments
 *
 * @param {string} targetType - 'post' or 'comment'
 * @param {string} targetAlias - Alias for target table (e.g., 'p' for posts)
 * @returns {string} SQL SELECT clause for reaction counts
 */
const reactionCountsSelect = (targetType, targetAlias) => {
  const idColumn = `${targetAlias}.id`;

  return `
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'like') as like_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'love') as love_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'laugh') as laugh_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'wow') as wow_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'sad') as sad_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn} AND r.reaction_type = 'angry') as angry_count,
    (SELECT COUNT(*) FROM reactions r
     WHERE r.${targetType}_id = ${idColumn}) as total_reactions
  `;
};

/**
 * Build vote count aggregation for group posts or comments
 *
 * @param {string} targetType - 'post' or 'comment'
 * @param {string} targetAlias - Alias for target table
 * @returns {string} SQL SELECT clause for vote counts
 */
const voteCountsSelect = (targetType, targetAlias) => {
  const idColumn = `${targetAlias}.id`;

  return `
    (SELECT COUNT(*) FROM group_votes gv
     WHERE gv.${targetType}_id = ${idColumn} AND gv.vote_type = 'upvote') as upvotes,
    (SELECT COUNT(*) FROM group_votes gv
     WHERE gv.${targetType}_id = ${idColumn} AND gv.vote_type = 'downvote') as downvotes,
    (SELECT
      COUNT(*) FILTER (WHERE vote_type = 'upvote') -
      COUNT(*) FILTER (WHERE vote_type = 'downvote')
     FROM group_votes gv
     WHERE gv.${targetType}_id = ${idColumn}) as score
  `;
};

/**
 * Build pagination LIMIT and OFFSET clause
 *
 * @param {number} limit - Number of records per page
 * @param {number} page - Page number (1-indexed)
 * @returns {object} Object with limit, offset, and SQL clause
 */
const buildPagination = (limit = 20, page = 1) => {
  const sanitizedLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const offset = (sanitizedPage - 1) * sanitizedLimit;

  return {
    limit: sanitizedLimit,
    offset,
    page: sanitizedPage,
    sql: `LIMIT ${sanitizedLimit} OFFSET ${offset}`
  };
};

/**
 * Build ORDER BY clause with direction
 *
 * @param {string} column - Column to sort by
 * @param {string} direction - 'ASC' or 'DESC' (default: 'DESC')
 * @returns {string} SQL ORDER BY clause
 */
const buildOrderBy = (column, direction = 'DESC') => {
  const sanitizedDirection = direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return `ORDER BY ${column} ${sanitizedDirection}`;
};

/**
 * Build WHERE clause for search across multiple columns
 *
 * @param {string} searchTerm - Search term
 * @param {string[]} columns - Columns to search in
 * @param {string} operator - SQL operator (default: 'ILIKE' for PostgreSQL)
 * @returns {object} Object with whereClause and value for parameterized query
 */
const buildSearchWhere = (searchTerm, columns, operator = 'ILIKE', paramIndex = 1) => {
  if (!searchTerm || !columns || columns.length === 0) {
    return { whereClause: '', value: null, paramIndex };
  }

  const conditions = columns.map(col => `${col} ${operator} $${paramIndex}`).join(' OR ');
  const whereClause = `(${conditions})`;
  const value = `%${searchTerm}%`;

  return { whereClause, value, paramIndex: paramIndex + 1 };
};

/**
 * Build common post metadata subquery
 * Includes comment count, reaction count, share count
 *
 * @param {string} postAlias - Alias for posts table (default: 'p')
 * @returns {string} SQL SELECT clause for post metadata
 */
const postMetadataSelect = (postAlias = 'p') => {
  return `
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = ${postAlias}.id AND c.is_published = true) as comment_count,
    (SELECT COUNT(*) FROM reactions r WHERE r.post_id = ${postAlias}.id) as reaction_count,
    (SELECT COUNT(*) FROM shares s WHERE s.post_id = ${postAlias}.id) as share_count
  `;
};

/**
 * Build common group post metadata subquery
 *
 * @param {string} postAlias - Alias for group_posts table
 * @returns {string} SQL SELECT clause for group post metadata
 */
const groupPostMetadataSelect = (postAlias = 'gp') => {
  return `
    (SELECT COUNT(*) FROM group_comments gc WHERE gc.post_id = ${postAlias}.id AND gc.is_published = true) as comment_count,
    (SELECT
      COUNT(*) FILTER (WHERE vote_type = 'upvote') -
      COUNT(*) FILTER (WHERE vote_type = 'downvote')
     FROM group_votes gv WHERE gv.post_id = ${postAlias}.id) as score,
    (SELECT COUNT(*) FROM group_votes gv WHERE gv.post_id = ${postAlias}.id AND gv.vote_type = 'upvote') as upvotes,
    (SELECT COUNT(*) FROM group_votes gv WHERE gv.post_id = ${postAlias}.id AND gv.vote_type = 'downvote') as downvotes
  `;
};

/**
 * Build privacy filter WHERE clause for posts
 *
 * @param {number} currentUserId - ID of current user (null if not authenticated)
 * @param {string} postAlias - Alias for posts table
 * @returns {object} Object with whereClause and values array
 */
const buildPostPrivacyFilter = (currentUserId, postAlias = 'p') => {
  if (!currentUserId) {
    // Not authenticated - only show public posts
    return {
      whereClause: `${postAlias}.privacy = 'public'`,
      values: []
    };
  }

  // Authenticated - show public, followers-only (if following), or own posts
  return {
    whereClause: `
      (${postAlias}.privacy = 'public'
       OR ${postAlias}.user_id = $1
       OR (${postAlias}.privacy = 'followers' AND EXISTS (
         SELECT 1 FROM follows f
         WHERE f.follower_id = $1 AND f.following_id = ${postAlias}.user_id
       )))
    `,
    values: [currentUserId]
  };
};

/**
 * Build time period filter for analytics queries
 *
 * @param {string} column - Timestamp column name
 * @param {string} period - 'day', 'week', 'month', 'year', or 'all'
 * @returns {string} SQL WHERE clause for time period
 */
const buildTimePeriodFilter = (column, period = 'week') => {
  switch (period.toLowerCase()) {
    case 'day':
      return `${column} >= NOW() - INTERVAL '1 day'`;
    case 'week':
      return `${column} >= NOW() - INTERVAL '1 week'`;
    case 'month':
      return `${column} >= NOW() - INTERVAL '1 month'`;
    case 'year':
      return `${column} >= NOW() - INTERVAL '1 year'`;
    case 'all':
    default:
      return '1=1'; // No filter
  }
};

/**
 * Build common group membership check subquery
 *
 * @param {number} userId - User ID to check
 * @param {string} groupIdColumn - Column reference for group ID
 * @returns {string} SQL EXISTS clause
 */
const buildGroupMembershipCheck = (userId, groupIdColumn) => {
  return `
    EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.user_id = ${userId}
        AND gm.group_id = ${groupIdColumn}
        AND gm.status = 'active'
    )
  `;
};

/**
 * Sanitize and validate sort direction
 *
 * @param {string} direction - Direction string
 * @param {string} defaultDirection - Default if invalid (default: 'DESC')
 * @returns {string} 'ASC' or 'DESC'
 */
const sanitizeSortDirection = (direction, defaultDirection = 'DESC') => {
  const upper = String(direction || '').toUpperCase();
  return upper === 'ASC' || upper === 'DESC' ? upper : defaultDirection;
};

/**
 * Sanitize and validate sort column against allowed list
 *
 * @param {string} column - Column to sort by
 * @param {string[]} allowedColumns - List of allowed column names
 * @param {string} defaultColumn - Default if invalid
 * @returns {string} Validated column name
 */
const sanitizeSortColumn = (column, allowedColumns, defaultColumn) => {
  return allowedColumns.includes(column) ? column : defaultColumn;
};

module.exports = {
  userDataSelect,
  userJoin,
  reactionCountsSelect,
  voteCountsSelect,
  buildPagination,
  buildOrderBy,
  buildSearchWhere,
  postMetadataSelect,
  groupPostMetadataSelect,
  buildPostPrivacyFilter,
  buildTimePeriodFilter,
  buildGroupMembershipCheck,
  sanitizeSortDirection,
  sanitizeSortColumn
};
