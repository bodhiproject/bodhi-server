const clientLogger = require('../utils/client-logger');

module.exports = {
  /**
   * POST request to log client errors.
   * @param {object} args Arguments including log level and log message.
   */
  async logClientError(args) {
    const { level, message } = args;
    if (!level) throw Error('level is not defined');
    if (!message) throw Error('message is not defined');

    if (level !== 'error') {
      throw Error('logClientError only accepts log level error');
    }

    clientLogger.error(message);
  },
};
