const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { authenticate } = require('../../middleware/auth');
const { uploads, processImage, uploadConfig } = require('../../services/fileUploadService');
const { config } = require('../../../config/app.config');
const db = require('../../config/database');

/**
 * POST /:id/images
 * Upload images for a marketplace listing
 */
router.post('/:id/images', authenticate, uploads.marketplaceImage.array('images', 10), async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);

    // Verify listing exists and user owns it
    const listingResult = await db.query(
      'SELECT * FROM marketplace_listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images were uploaded'
      });
    }

    // Get current image count for this listing
    const countResult = await db.query(
      'SELECT COUNT(*) as count FROM marketplace_media WHERE listing_id = $1',
      [listingId]
    );
    let displayOrder = parseInt(countResult.rows[0].count);

    // Process uploaded images
    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // Get image metadata
        const metadata = await sharp(file.path).metadata();

        // Generate thumbnail
        const thumbnailFilename = `thumb_${path.basename(file.path)}`;
        const thumbnailPath = path.join(path.dirname(file.path), thumbnailFilename);

        await sharp(file.path)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        // Store relative paths using centralized config
        const fileUrl = uploadConfig.getUrlPath('marketplace', path.basename(file.path));
        const thumbnailUrl = uploadConfig.getUrlPath('marketplace', thumbnailFilename);

        // Check if this should be the primary image (first image uploaded)
        const isPrimary = displayOrder === 0;

        // Insert into database
        const result = await db.query(
          `INSERT INTO marketplace_media
           (listing_id, file_url, file_type, file_size, display_order, is_primary, width, height, thumbnail_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            listingId,
            fileUrl,
            file.mimetype,
            file.size,
            displayOrder,
            isPrimary,
            metadata.width,
            metadata.height,
            thumbnailUrl
          ]
        );

        uploadedImages.push(result.rows[0]);
        displayOrder++;

      } catch (error) {
        console.error('Error processing image:', error);
        // Clean up file on error
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', file.path, unlinkError);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    // Clean up any uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', file.path, unlinkError);
        }
      }
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images'
    });
  }
});

/**
 * DELETE /:listingId/images/:imageId
 * Delete a specific image from a listing
 */
router.delete('/:listingId/images/:imageId', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const imageId = parseInt(req.params.imageId);

    // Verify listing exists and user owns it
    const listingResult = await db.query(
      'SELECT * FROM marketplace_listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission'
      });
    }

    // Get the image record
    const imageResult = await db.query(
      'SELECT * FROM marketplace_media WHERE id = $1 AND listing_id = $2',
      [imageId, listingId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    const image = imageResult.rows[0];

    // Delete physical files
    const filePath = path.join(__dirname, '../../..', image.file_url);
    const thumbnailPath = path.join(__dirname, '../../..', image.thumbnail_url);

    try {
      await fs.unlink(filePath);
      await fs.unlink(thumbnailPath);
    } catch (fileError) {
      console.error('Failed to delete files:', fileError);
    }

    // Delete from database
    await db.query('DELETE FROM marketplace_media WHERE id = $1', [imageId]);

    // If this was the primary image, make another image primary
    if (image.is_primary) {
      await db.query(
        `UPDATE marketplace_media
         SET is_primary = TRUE
         WHERE listing_id = $1
         AND id = (SELECT id FROM marketplace_media WHERE listing_id = $1 ORDER BY display_order LIMIT 1)`,
        [listingId]
      );
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

/**
 * PUT /:listingId/images/:imageId/primary
 * Set an image as the primary image
 */
router.put('/:listingId/images/:imageId/primary', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const imageId = parseInt(req.params.imageId);

    // Verify listing exists and user owns it
    const listingResult = await db.query(
      'SELECT * FROM marketplace_listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission'
      });
    }

    // Verify image exists for this listing
    const imageResult = await db.query(
      'SELECT * FROM marketplace_media WHERE id = $1 AND listing_id = $2',
      [imageId, listingId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Clear all primary flags for this listing
    await db.query(
      'UPDATE marketplace_media SET is_primary = FALSE WHERE listing_id = $1',
      [listingId]
    );

    // Set this image as primary
    await db.query(
      'UPDATE marketplace_media SET is_primary = TRUE WHERE id = $1',
      [imageId]
    );

    res.json({
      success: true,
      message: 'Primary image updated successfully'
    });

  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set primary image'
    });
  }
});

/**
 * PUT /:listingId/images/reorder
 * Reorder images for a listing
 */
router.put('/:listingId/images/reorder', authenticate, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { imageOrder } = req.body; // Array of image IDs in desired order

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        error: 'imageOrder must be an array'
      });
    }

    // Verify listing exists and user owns it
    const listingResult = await db.query(
      'SELECT * FROM marketplace_listings WHERE id = $1 AND user_id = $2',
      [listingId, req.user.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found or you do not have permission'
      });
    }

    // Update display_order for each image
    for (let i = 0; i < imageOrder.length; i++) {
      await db.query(
        'UPDATE marketplace_media SET display_order = $1 WHERE id = $2 AND listing_id = $3',
        [i, imageOrder[i], listingId]
      );
    }

    res.json({
      success: true,
      message: 'Image order updated successfully'
    });

  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder images'
    });
  }
});

module.exports = router;
