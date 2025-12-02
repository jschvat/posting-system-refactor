/**
 * Centralized URL helper utilities
 * Provides consistent URL transformation across the application
 */

/**
 * Get the API base URL from environment or default
 * @returns {string} The base URL for the API
 */
const getApiBaseUrl = () => {
  return process.env.API_BASE_URL || 'http://localhost:3001';
};

/**
 * Converts a relative path to a full URL
 * If the path is already a full URL, returns it unchanged
 * In development, returns relative paths to allow mobile devices to work
 *
 * @param {string|null|undefined} relativePath - The relative path to convert
 * @param {boolean} forceAbsolute - Force absolute URL even in development
 * @returns {string|null} The full URL or relative path, or null if no path provided
 */
const getFullUrl = (relativePath, forceAbsolute = false) => {
  if (!relativePath) return null;

  // If already a full URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Ensure path starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  // In development, return relative URLs unless forced, so mobile devices can use their network IP
  // In production, return absolute URLs
  if (process.env.NODE_ENV === 'development' && !forceAbsolute) {
    return path;
  }

  return `${getApiBaseUrl()}${path}`;
};

/**
 * Converts a relative avatar URL to a full URL
 * Alias for getFullUrl for backward compatibility
 *
 * @param {string|null|undefined} relativePath - The relative avatar path
 * @returns {string|null} The full avatar URL or null
 */
const getFullAvatarUrl = (relativePath) => {
  return getFullUrl(relativePath);
};

/**
 * Converts a relative banner URL to a full URL
 * Alias for getFullUrl for backward compatibility
 *
 * @param {string|null|undefined} relativePath - The relative banner path
 * @returns {string|null} The full banner URL or null
 */
const getFullBannerUrl = (relativePath) => {
  return getFullUrl(relativePath);
};

/**
 * Converts a relative media URL to a full URL
 * Alias for getFullUrl for backward compatibility
 *
 * @param {string|null|undefined} relativePath - The relative media path
 * @returns {string|null} The full media URL or null
 */
const getFullMediaUrl = (relativePath) => {
  return getFullUrl(relativePath);
};

/**
 * Transforms an object by converting specified relative URL fields to full URLs
 *
 * @param {object} obj - The object to transform
 * @param {string[]} urlFields - Array of field names to transform
 * @returns {object} New object with transformed URL fields
 */
const transformObjectWithFullUrls = (obj, urlFields) => {
  if (!obj) return null;

  const transformed = { ...obj };

  urlFields.forEach(field => {
    if (transformed[field]) {
      transformed[field] = getFullUrl(transformed[field]);
    }
  });

  return transformed;
};

/**
 * Transforms a user object with full URLs for avatar and banner
 *
 * @param {object} user - The user object
 * @returns {object} User object with full URLs
 */
const transformUserWithFullUrls = (user) => {
  return transformObjectWithFullUrls(user, ['avatar_url', 'banner_url']);
};

/**
 * Transforms a group object with full URLs for avatar and banner
 *
 * @param {object} group - The group object
 * @returns {object} Group object with full URLs
 */
const transformGroupWithFullUrls = (group) => {
  return transformObjectWithFullUrls(group, ['avatar_url', 'banner_url']);
};

/**
 * Transforms a post object with full URLs for media
 *
 * @param {object} post - The post object
 * @returns {object} Post object with full URLs
 */
const transformPostWithFullUrls = (post) => {
  if (!post) return null;

  const transformed = { ...post };

  // Transform user URLs if present
  if (transformed.avatar_url) {
    transformed.avatar_url = getFullUrl(transformed.avatar_url);
  }

  // Transform media URLs
  if (transformed.media_url) {
    transformed.media_url = getFullUrl(transformed.media_url);
  }

  if (transformed.media_thumbnail_url) {
    transformed.media_thumbnail_url = getFullUrl(transformed.media_thumbnail_url);
  }

  // Transform shared post if present
  if (transformed.shared_post) {
    transformed.shared_post = transformPostWithFullUrls(transformed.shared_post);
  }

  return transformed;
};

/**
 * Transforms an array of objects with full URLs
 *
 * @param {Array} items - Array of objects to transform
 * @param {Function} transformFn - Transform function to apply to each item
 * @returns {Array} Array of transformed objects
 */
const transformArrayWithFullUrls = (items, transformFn) => {
  if (!Array.isArray(items)) return items;
  return items.map(item => transformFn(item));
};

module.exports = {
  getApiBaseUrl,
  getFullUrl,
  getFullAvatarUrl,
  getFullBannerUrl,
  getFullMediaUrl,
  transformObjectWithFullUrls,
  transformUserWithFullUrls,
  transformGroupWithFullUrls,
  transformPostWithFullUrls,
  transformArrayWithFullUrls
};
