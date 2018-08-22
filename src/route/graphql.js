const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const { db } = require('../db');

let apollo;

const createApolloServer = (app) => {
  apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: { db },
    introspection: true, // enabled playground in prod
    playground: true, // enabled playground in prod
  });
  apollo.applyMiddleware({ app });
};

const handleSubscriptions = (httpServer) => {
  apollo.installSubscriptionHandlers(httpServer);
};

module.exports = {
  createApolloServer,
  handleSubscriptions,
};
