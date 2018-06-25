const express = require('express');

const apiRoutes = require('./api');
const { graphqlRouter, getSubscriptionServer } = require('./graphql');
const { getLogger } = require('../utils/logger');
const { Config } = require('../config');

const server;

const initApiServer = () => {
  server = express();

  // Allow CORS
  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Handle parsing application/json
  server.use(bodyParser.json()); 

  // server.on('after', (req, res, route, err) => {
  //   if (route) {
  //     getLogger().debug(`${route.methods[0]} ${route.spec.path} ${res.statusCode}`);
  //   } else {
  //     getLogger().error(`${err.message}`);
  //   }
  // });

  // Apply all routes
  server.use('/', apiRoutes);
  server.use('/', graphqlRoutes);

  server.listen(Config.PORT, () => {
    createSubscriptionServer();
    getLogger().info(`Bodhi API is running at http://${Config.HOSTNAME}:${Config.PORT}.`);
  });
};

module.exports = initApiServer;
