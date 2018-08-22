const express = require('express');
const https = require('https');
const path = require('path');
const expressWinston = require('express-winston');
const helmet = require('helmet');

const apiRouter = require('./api');
const { createApolloServer, handleSubscriptions } = require('./graphql');
const { getLogger } = require('../utils/logger');
const { Config, getSSLCredentials } = require('../config');

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
    winstonInstance: getLogger(),
    meta: false,
    msg: '{{req.method}} {{req.path}} {{res.statusCode}} {{res.body}}',
    colorize: true,
  }));

  return app;
};

const createServer = app => https.createServer(getSSLCredentials(), app);

const initApiServer = () => {
  const fs = require('fs');
  const key = fs.readFileSync('/run/secrets/privkey.pem');
  console.log(key);

  try {
    const app = initExpressApp();

    app.use('/', apiRouter); // Apply API routes
    createApolloServer(app); // Apply GraphQL routes

    const server = createServer(app);
    handleSubscriptions(server);
    server.listen(Config.PORT_API, () => {
      getLogger().info(`API served at http://${Config.HOSTNAME}:${Config.PORT_API}`);
      getLogger().info(`Subscriptions served at ws://${Config.HOSTNAME}:${Config.PORT_API}/graphql`);
    });
  } catch (err) {
    getLogger().error(`Error starting API Server: ${err.message}`);
    require('../server').exit('SIGTERM'); // eslint-disable-line
  }
};

const initWebServer = () => {
  try {
    const app = initExpressApp();

    const uiDir = path.join(__dirname, '../../node_modules/bodhi-ui/build');
    app.use(express.static(uiDir));

    const server = createServer(app);
    server.listen(Config.PORT_HTTP, () => {
      getLogger().info(`UI served at http://${Config.HOSTNAME}:${Config.PORT_HTTP}`);
    });
  } catch (err) {
    getLogger().error(`Error starting Web Server: ${err.message}`);
    require('../server').exit('SIGTERM'); // eslint-disable-line
  }
};

module.exports = {
  initApiServer,
  initWebServer,
};
