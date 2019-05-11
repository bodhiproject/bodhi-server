const { Router } = require('express');
const configManagerRoutes = require('./api-config-manager');
const multipleResultsEventRoutes = require('./api-multiple-results-event');

const router = Router();
router.use('/config-manager', configManagerRoutes);
router.use('/multiple-results-event', multipleResultsEventRoutes);

module.exports = router;
