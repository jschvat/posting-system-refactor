/**
 * Centralized file upload service
 * Handles multer configuration, file validation, and image processing
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Create a multer storage configuration for file uploads
 *
 * @param {string} uploadPath - Relative path from routes directory (e.g., '../uploads/avatars')
 * @param {string} filePrefix - Prefix for generated filenames (e.g., 'user-avatar', 'group-banner')
 * @returns {multer.StorageEngine} Configured multer storage engine
 */
const createStorage = (uploadPath, filePrefix) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', uploadPath);
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, `${filePrefix}-${uniqueId}${ext}`);
    }
  });
};

/**
 * Standard file filter for images
 *
 * @param {array} allowedTypes - Array of allowed MIME types (default: common image types)
 * @returns {function} Multer file filter function
 */
const createImageFilter = (allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

/**
 * Standard file filter for media (images and videos)
 *
 * @returns {function} Multer file filter function
 */
const createMediaFilter = () => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm'
  ];

  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

/**
 * Create a configured multer upload instance
 *
 * @param {object} options - Configuration options
 * @param {string} options.uploadPath - Upload directory path
 * @param {string} options.filePrefix - Filename prefix
 * @param {number} options.maxSize - Max file size in bytes (default: 5MB)
 * @param {string} options.filterType - 'image' or 'media' (default: 'image')
 * @param {boolean} options.single - Single file upload (default: true)
 * @param {string} options.fieldName - Form field name (default: 'file')
 * @returns {multer.Multer} Configured multer instance
 */
const createUploadMiddleware = ({
  uploadPath,
  filePrefix,
  maxSize = 5 * 1024 * 1024, // 5MB default
  filterType = 'image',
  single = true,
  fieldName = 'file'
}) => {
  const storage = createStorage(uploadPath, filePrefix);
  const fileFilter = filterType === 'media' ? createMediaFilter() : createImageFilter();

  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter
  });

  // Return the multer object so routes can call .single() or .array() with their own field names
  return upload;
};

/**
 * Process and resize an uploaded image
 *
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path for output image
 * @param {object} options - Resize options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height (optional)
 * @param {boolean} options.fit - Fit mode (default: 'cover')
 * @param {number} options.quality - JPEG quality 1-100 (default: 80)
 * @returns {Promise<object>} Image metadata
 */
const processImage = async (inputPath, outputPath, options = {}) => {
  const {
    width = 800,
    height = null,
    fit = 'cover',
    quality = 80
  } = options;

  let sharpInstance = sharp(inputPath);

  // Resize if dimensions provided
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit,
      withoutEnlargement: true
    });
  }

  // Convert to JPEG and apply quality
  await sharpInstance
    .jpeg({ quality })
    .toFile(outputPath);

  // Get metadata
  const metadata = await sharp(outputPath).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size
  };
};

/**
 * Create a thumbnail from an image
 *
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path for thumbnail
 * @param {number} size - Thumbnail size (square, default: 200)
 * @returns {Promise<object>} Thumbnail metadata
 */
const createThumbnail = async (inputPath, outputPath, size = 200) => {
  await sharp(inputPath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 75 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    size: metadata.size
  };
};

/**
 * Delete a file if it exists
 *
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if deleted, false if didn't exist
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false; // File doesn't exist
    }
    throw error;
  }
};

/**
 * Common upload configurations for different use cases
 */
const uploadConfigs = {
  userAvatar: {
    uploadPath: '../uploads/users/avatars',
    filePrefix: 'user-avatar',
    maxSize: 5 * 1024 * 1024, // 5MB
    filterType: 'image',
    processOptions: {
      width: 200,
      height: 200,
      fit: 'cover',
      quality: 85
    }
  },

  userBanner: {
    uploadPath: '../uploads/users/banners',
    filePrefix: 'user-banner',
    maxSize: 10 * 1024 * 1024, // 10MB
    filterType: 'image',
    processOptions: {
      width: 1500,
      height: 500,
      fit: 'cover',
      quality: 85
    }
  },

  groupAvatar: {
    uploadPath: '../uploads/groups/avatars',
    filePrefix: 'group-avatar',
    maxSize: 5 * 1024 * 1024,
    filterType: 'image',
    processOptions: {
      width: 400,
      height: 400,
      fit: 'cover',
      quality: 85
    }
  },

  groupBanner: {
    uploadPath: '../uploads/groups/banners',
    filePrefix: 'group-banner',
    maxSize: 10 * 1024 * 1024,
    filterType: 'image',
    processOptions: {
      width: 1200,
      height: 400,
      fit: 'cover',
      quality: 85
    }
  },

  postMedia: {
    uploadPath: '../uploads/posts',
    filePrefix: 'post-media',
    maxSize: 50 * 1024 * 1024, // 50MB
    filterType: 'media',
    processOptions: {
      width: 1200,
      quality: 85
    }
  },

  messageAttachment: {
    uploadPath: '../uploads/messages',
    filePrefix: 'message-attachment',
    maxSize: 20 * 1024 * 1024, // 20MB
    filterType: 'media'
  },

  marketplaceImage: {
    uploadPath: '../uploads/marketplace',
    filePrefix: 'listing-image',
    maxSize: 10 * 1024 * 1024,
    filterType: 'image',
    processOptions: {
      width: 1000,
      height: 1000,
      fit: 'inside',
      quality: 85
    }
  }
};

// Create pre-configured upload middleware for each config
const uploads = {
  userAvatar: createUploadMiddleware(uploadConfigs.userAvatar),
  userBanner: createUploadMiddleware(uploadConfigs.userBanner),
  groupAvatar: createUploadMiddleware(uploadConfigs.groupAvatar),
  groupBanner: createUploadMiddleware(uploadConfigs.groupBanner),
  postMedia: createUploadMiddleware(uploadConfigs.postMedia),
  messageAttachment: createUploadMiddleware(uploadConfigs.messageAttachment),
  marketplaceImage: createUploadMiddleware(uploadConfigs.marketplaceImage)
};

module.exports = {
  createStorage,
  createImageFilter,
  createMediaFilter,
  createUploadMiddleware,
  processImage,
  createThumbnail,
  deleteFile,
  uploadConfigs,
  uploads
};
