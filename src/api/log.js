module.exports = {
  async logClientError(args) {
    try {
      return getContract().methods.bodhiTokenAddress().call();
    } catch (err) {
      logger.error(`Error ConfigManager.bodhiTokenAddress(): ${err.message}`);
      throw err;
    }
  },
};
