/**
 * Centralized Upload Configuration
 *
 * This module provides a single source of truth for all upload paths.
 * All paths are derived from environment variables defined in .env
 *
 * Directory structure (at project root):
 * /uploads/
 *   ├── avatars/         - User profile avatars
 *   ├── images/          - General post images
 *   ├── posts/           - Post media files
 *   ├── messages/        - Message attachments
 *   ├── marketplace/     - Marketplace listing images
 *   └── groups/
 *       ├── avatars/     - Group profile avatars
 *       ├── banners/     - Group banner images
 *       ├── media/       - Group post media
 *       └── images/      - Group images
 */

const path = require('path');

// Base directory for all uploads (relative to backend directory)
const UPLOADS_BASE_DIR = process.env.UPLOADS_BASE_DIR || '../uploads';

// Resolve to absolute path from backend/src/config directory
// __dirname is /backend/src/config, so we go up to /backend first, then apply the relative path
const baseDir = path.resolve(__dirname, '../..', UPLOADS_BASE_DIR);

// Subdirectory paths from environment
const paths = {
  images: process.env.UPLOAD_IMAGES_PATH || 'images',
  avatars: process.env.UPLOAD_AVATARS_PATH || 'avatars',
  posts: process.env.UPLOAD_POSTS_PATH || 'posts',
  messages: process.env.UPLOAD_MESSAGES_PATH || 'messages',
  marketplace: process.env.UPLOAD_MARKETPLACE_PATH || 'marketplace',
  groupAvatars: process.env.UPLOAD_GROUP_AVATARS_PATH || 'groups/avatars',
  groupBanners: process.env.UPLOAD_GROUP_BANNERS_PATH || 'groups/banners',
  groupMedia: process.env.UPLOAD_GROUP_MEDIA_PATH || 'groups/media',
  groupImages: process.env.UPLOAD_GROUP_IMAGES_PATH || 'groups/images',
};

/**
 * Get absolute path to a specific upload directory
 * @param {string} type - Type of upload (images, avatars, posts, etc.)
 * @returns {string} Absolute filesystem path
 */
function getUploadDir(type) {
  const subpath = paths[type];
  if (!subpath) {
    throw new Error(`Unknown upload type: ${type}`);
  }
  return path.join(baseDir, subpath);
}

/**
 * Get URL path for serving uploaded files
 * @param {string} type - Type of upload
 * @param {string} filename - Optional filename to append
 * @returns {string} URL path (e.g., /uploads/images/file.jpg)
 */
function getUrlPath(type, filename = '') {
  const subpath = paths[type];
  if (!subpath) {
    throw new Error(`Unknown upload type: ${type}`);
  }
  const urlPath = `/uploads/${subpath}`;
  return filename ? `${urlPath}/${filename}` : urlPath;
}

/**
 * Get URL path from a full filesystem path
 * @param {string} filePath - Absolute filesystem path
 * @returns {string} URL path
 */
function filePathToUrl(filePath) {
  const relativePath = path.relative(baseDir, filePath);
  return `/uploads/${relativePath.replace(/\\/g, '/')}`;
}

module.exports = {
  baseDir,
  paths,
  getUploadDir,
  getUrlPath,
  filePathToUrl,

  // Direct access to resolved absolute paths
  dirs: {
    base: baseDir,
    images: path.join(baseDir, paths.images),
    avatars: path.join(baseDir, paths.avatars),
    posts: path.join(baseDir, paths.posts),
    messages: path.join(baseDir, paths.messages),
    marketplace: path.join(baseDir, paths.marketplace),
    groupAvatars: path.join(baseDir, paths.groupAvatars),
    groupBanners: path.join(baseDir, paths.groupBanners),
    groupMedia: path.join(baseDir, paths.groupMedia),
    groupImages: path.join(baseDir, paths.groupImages),
  }
};
