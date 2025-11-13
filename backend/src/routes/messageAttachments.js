const express = require('express');
const router = express.Router();
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { uploads } = require('../services/fileUploadService');

/**
 * @route   POST /api/message-attachments/upload
 * @desc    Upload a file attachment for a message
 * @access  Private
 */
router.post('/upload', authenticate, uploads.messageAttachment.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Return file information for use in message creation
    res.json({
      success: true,
      data: {
        attachment_url: `/uploads/messages/${req.file.filename}`,
        attachment_type: req.file.mimetype,
        attachment_size: req.file.size,
        attachment_name: req.file.originalname,
        message_type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    });
  }
});

module.exports = router;
