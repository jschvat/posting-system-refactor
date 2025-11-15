/**
 * Group Posts Router - Main entry point
 * Combines all group post route modules
 */
const express = require('express');
const router = express.Router();

// Import sub-routers
const postsCRUDRouter = require('./postsCRUD');
const postsDiscoveryRouter = require('./postsDiscovery');
const postsVotingRouter = require('./postsVoting');
const postsModeratorRouter = require('./postsModerator');

// Mount sub-routers
// Note: Order matters! Specific routes (like /pending, /top, /removed) must come before dynamic params (/:postId)
router.use('/', postsDiscoveryRouter);  // /pending, /top, /removed, /moderate/all - must be first
router.use('/', postsCRUDRouter);        // /:slug/posts, /:slug/posts/:postId
router.use('/', postsVotingRouter);      // /:slug/posts/:postId/vote
router.use('/', postsModeratorRouter);   // /:slug/posts/:postId/pin, /lock, /remove, etc.

module.exports = router;
