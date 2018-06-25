const express = require('express');

const initApiServer = () => {
  server = restify.createServer({ title: 'Bodhi API' });
  const cors = corsMiddleware({ origins: ['*'] });
  server.pre(cors.preflight);
  server.use(cors.actual);
  server.use(restify.plugins.bodyParser({ mapParams: true }));
  server.use(restify.plugins.queryParser());
  server.on('after', (req, res, route, err) => {
    if (route) {
      getLogger().debug(`${route.methods[0]} ${route.spec.path} ${res.statusCode}`);
    } else {
      getLogger().error(`${err.message}`);
    }
  });

  syncRouter.applyRoutes(server);
  apiRouter.applyRoutes(server);

  server.listen(Config.PORT, () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    getLogger().info(`Bodhi API is running at http://${Config.HOSTNAME}:${Config.PORT}.`);
  });
};

module.exports = initApiServer;
