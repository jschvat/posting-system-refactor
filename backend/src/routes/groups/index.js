const express = require('express');
const router = express.Router();

const coreRoutes = require('./core');
const settingsRoutes = require('./settings');
const membersRoutes = require('./members');
const moderationRoutes = require('./moderation');

router.use('/', coreRoutes);
router.use('/', settingsRoutes);
router.use('/', membersRoutes);
router.use('/', moderationRoutes);

module.exports = router;
