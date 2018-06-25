const express = require('express');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const { createServer } = require('http');

const apiRouter = require('./api');
const { graphqlRouter, createSubscriptionServer } = require('./graphql');
const { getLogger } = require('../utils/logger');
const { Config } = require('../config');

const initApiServer = () => {
  let server = express();

  // Allow CORS
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Setup for JSON and url encoded bodies
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Route responses to Winston logger
  server.use(expressWinston.logger({
    winstonInstance: getLogger(),
    meta: false,
    msg: '{{req.method}} {{req.path}} {{res.statusCode}} {{res.body}}',
    colorize: true,
  }));

  // Apply all routes
  server.use('/', apiRouter);
  server.use('/', graphqlRouter);

  // Wrap server for subscriptions
  server = createServer(server);
  server.listen(Config.PORT, () => {
    createSubscriptionServer(server);
    getLogger().info(`Bodhi API is running at http://${Config.HOSTNAME}:${Config.PORT}.`);
  });
};

module.exports = initApiServer;
