const { getInstance } = require('../qclient');

const Network = {
  async getPeerNodeCount() {
    return getInstance().getPeerInfo().length || 0;
  },
};

module.exports = Network;
