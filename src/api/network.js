const { getInstance } = require('../qclient');

const Network = {
  async getPeerNodeCount() {
    const peers = await getInstance().getPeerInfo();
    return peers.length || 0;
  },
};

module.exports = Network;
