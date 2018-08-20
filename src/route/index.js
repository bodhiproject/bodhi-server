const express = require('express');
const WebSocketServer = require('ws').Server;
const { createServer } = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const helmet = require('helmet');

const apiRouter = require('./api');
const { killQtumProcess } = require('../server');
const { graphqlRouter, createSubscriptionServer } = require('./graphql');
const { getLogger } = require('../utils/logger');
const { Config } = require('../config');

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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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

const initApiServer = () => {
  try {
    const app = initExpressApp();

    // Apply all routes
    app.use('/', apiRouter);
    app.use('/', graphqlRouter);

    // Create server
    const server = createServer(app);
    server.listen(Config.PORT_API, () => {
      // Apply subscription route
      createSubscriptionServer(app);
      getLogger().info(`API served at http://${Config.HOSTNAME}:${Config.PORT_API}`);
    });
    // const wss = new WebSocketServer({ server }, () => {
    //   getLogger().info(`Subscriptions served at http://${Config.HOSTNAME}:${Config.PORT_API}`);
    // });
  } catch (err) {
    getLogger().error(`Error starting API Server: ${err.message}`);
    killQtumProcess(false);
  }
};

const initWebServer = () => {
  try {
    const app = initExpressApp();
    const uiDir = path.join(__dirname, '../../node_modules/bodhi-ui/build');
    app.use(express.static(uiDir));
    app.listen(Config.PORT_HTTP, () => {
      getLogger().info(`UI served at http://${Config.HOSTNAME}:${Config.PORT_HTTP}`);
    });
  } catch (err) {
    getLogger().error(`Error starting Web Server: ${err.message}`);
    killQtumProcess(false);
  }
};

module.exports = {
  initApiServer,
  initWebServer,
};
