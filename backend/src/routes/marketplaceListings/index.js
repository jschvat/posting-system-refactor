/**
 * Marketplace Listings Router - Main entry point
 * Combines all marketplace listing route modules
 */
const express = require('express');
const router = express.Router();

// Import sub-routers
const browseRouter = require('./browse');
const mediaRouter = require('./media');
const crudRouter = require('./crud');

// Mount sub-routers
// Note: Order matters! Specific routes must come before dynamic params
router.use('/', browseRouter);   // /, /nearby - must be before /:id
router.use('/', mediaRouter);    // /:id/images, /:listingId/images/:imageId
router.use('/', crudRouter);     // /:id (GET/PUT/DELETE), /my-listings, /:id/save

module.exports = router;
