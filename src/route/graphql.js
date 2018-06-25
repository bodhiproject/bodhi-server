const { Router } = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress } = require('apollo-server-express');

const { db } = require('../db');
const schema = require('../schema');
const { Config } = require('../config');

const router = Router();

router.use('/graphql', bodyParser.json(), graphqlExpress({ 
  context: { db },
  schema 
}));

// GraphQL web interface for querying
// router.get('/graphiql', graphiqlRestify({
//   endpointURL: '/graphql',
//   subscriptionsEndpoint: `ws://${Config.HOSTNAME}:${Config.PORT}/subscriptions`,
// }));

module.exports = router;
