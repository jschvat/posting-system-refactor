/**
 * Comments Router - Main entry point
 * Combines all comment route modules
 */
const express = require('express');
const router = express.Router();

// Import sub-routers
const retrievalRouter = require('./retrieval');
const crudRouter = require('./crud');
const interactionsRouter = require('./interactions');

// Mount sub-routers
// Note: Order matters! Specific routes must come before dynamic params
router.use('/', retrievalRouter);      // /post/:postId, /post/:postId/hierarchical, /:id/replies
router.use('/', interactionsRouter);   // /track-interaction
router.use('/', crudRouter);            // /:id (GET/PUT/DELETE), / (POST)

module.exports = router;
