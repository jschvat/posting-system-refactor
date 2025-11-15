/**
 * Posts Router - Main entry point
 * Combines all post route modules
 */
const express = require('express');
const router = express.Router();

// Import sub-routers
const coreRouter = require('./core');
const moderationRouter = require('./moderation');

// Mount sub-routers
// Note: Moderation routes with specific paths must come before general /:id routes
router.use('/', moderationRouter);  // /:id/moderate/delete, /:id/moderate/restore - specific paths first
router.use('/', coreRouter);         // /, /:id (GET/PUT/DELETE)

module.exports = router;
