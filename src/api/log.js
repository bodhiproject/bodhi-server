const clientLogger = require('../utils/client-logger');

module.exports = {
  /**
   * POST request to log client errors.
   * @param {object} args Arguments including log level and log message.
   */
  async logClientError(args) {
    const { message } = args;
    if (!message) throw Error('message is not defined');

    clientLogger.error(message);
  },
};
