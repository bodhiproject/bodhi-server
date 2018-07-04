const { getInstance } = require('../qclient');

const Network = {
  async getPeerNodeCount() {
    const nodeCount = await getInstance().getPeerInfo();
    return await nodeCount.length || 0;
  },
};

module.exports = Network;
