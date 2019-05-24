const express = require('express');
const http = require('http');
const https = require('https');
const expressWinston = require('express-winston');
const helmet = require('helmet');
const applyRoutes = require('./api');
const { createApolloServer, handleSubscriptions } = require('./graphql');
const logger = require('../utils/logger');
const { CONFIG, getSSLCredentials } = require('../config');
const { BLOCKCHAIN_ENV } = require('../constants');

const initExpressApp = () => {
  const app = express();

  // Allow CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Set security-related HTTPS headers
  app.use(helmet());

  // Setup for JSON and url encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Route responses to Winston logger
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: false,
    msg: '{{req.method}} {{req.path}} {{res.statusCode}} {{res.body}}',
    colorize: true,
  }));

  return app;
};

const createServer = (app) => {
  if (CONFIG.PROTOCOL === 'https') {
    return https.createServer(getSSLCredentials(), app);
  }
  return http.createServer(app);
};

const initApiServer = () => {
  try {
    const app = initExpressApp();

    applyRoutes(app); // Apply API routes
    createApolloServer(app); // Apply GraphQL routes

    const server = createServer(app);
    handleSubscriptions(server);

    const port = CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET
      ? CONFIG.API_PORT_MAINNET
      : CONFIG.API_PORT_TESTNET;
    server.listen(port, () => {
      logger.info(`API served at ${CONFIG.PROTOCOL}://${CONFIG.HOSTNAME}:${port}`);
    });
  } catch (err) {
    logger.error(`Error starting API/GraphQL Server: ${err.message}`);
    throw err;
  }
};

module.exports = initApiServer;
