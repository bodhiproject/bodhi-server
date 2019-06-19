const { each } = require('lodash');
const clientLogger = require('../utils/client-logger');

module.exports = {
  /**
   * POST request to log client errors.
   * @param {object} args Arguments for the API.
   */
  async logClientErrors(args) {
    const { logs } = args;
    if (!logs) throw Error('logs is not defined');

    each(logs, (log) => {
      if (log.level === 'error') {
        clientLogger.error(log.message);
      }
    });
  },
};
