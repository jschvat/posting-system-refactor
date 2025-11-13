/**
 * Centralized validation middleware
 * Provides common validation error handling for all routes
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to check for express-validator validation errors
 * Returns a standardized error response if validation fails
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @returns {object} JSON error response or calls next()
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        type: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

module.exports = {
  handleValidationErrors
};
