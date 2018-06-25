const { Router } = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const { db } = require('../db');
const schema = require('../schema');
const { Config } = require('../config');

const graphqlRouter = Router();

const options = graphqlExpress({ context: { db }, schema});
graphqlRouter.get('/graphql', options);
graphqlRouter.post('/graphql', bodyParser.json(), options);

// GraphQL web interface for querying
graphqlRouter.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://${Config.HOSTNAME}:${Config.PORT}/subscriptions`,
}));

const createSubscriptionServer = (server) => {
  SubscriptionServer.create(
    { execute, subscribe, schema },
    { server, path: '/subscriptions' },
  );
};

module.exports = {
  graphqlRouter,
  createSubscriptionServer,
};
