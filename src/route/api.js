const logRoutes = require('./api-log');
const configManagerRoutes = require('./api-config-manager');
const multipleResultsEventRoutes = require('./api-multiple-results-event');
const addressNameService = require('./api-address-name-service');

module.exports = (app) => {
  app.use('/log', logRoutes);
  app.use('/config-manager', configManagerRoutes);
  app.use('/multiple-results-event', multipleResultsEventRoutes);
  app.use('/address-name-service', addressNameService);
};
