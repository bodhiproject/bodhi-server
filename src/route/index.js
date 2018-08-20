const express = require('express');
const WebSocketServer = require('ws').Server;
const path = require('path');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const http = require('http');
const helmet = require('helmet');

const apiRouter = require('./api');
const { killQtumProcess } = require('../server');
const { graphqlRouter, createSubscriptionServer } = require('./graphql');
const { getLogger } = require('../utils/logger');
const { Config } = require('../config');

const app = express();

const initApiServer = () => {
  try {
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

    // Apply all routes
    app.use('/', apiRouter);
    app.use('/', graphqlRouter);

    // Wrap server for subscriptions
    const server = http.createServer(app).listen(Config.PORT_API, () => {
      createSubscriptionServer(app);
      getLogger().info(`Bodhi API is running at http://${Config.HOSTNAME}:${Config.PORT_API}.`);
    });
    const wss = new WebSocketServer({ server });
  } catch (err) {
    getLogger().error(`Error starting API Server: ${err.message}`);
    killQtumProcess(false);
  }
};

const initWebServer = () => {
  try {
    const uiDir = path.join(__dirname, '../../node_modules/bodhi-ui/build');
    app.use(express.static(uiDir));
    http.createServer(app).listen(Config.PORT_HTTP);
  } catch (err) {
    getLogger().error(`Error starting Web Server: ${err.message}`);
    killQtumProcess(false);
  }
};

module.exports = {
  initApiServer,
  initWebServer,
};
