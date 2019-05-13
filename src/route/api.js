const configManagerRoutes = require('./api-config-manager');
const multipleResultsEventRoutes = require('./api-multiple-results-event');

module.exports = (app) => {
  app.use('/config-manager', configManagerRoutes);
  app.use('/multiple-results-event', multipleResultsEventRoutes);
};
