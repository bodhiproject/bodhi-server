<<<<<<< HEAD
<<<<<<< HEAD
=======
const _ = require('lodash');

>>>>>>> update and change to peerNodeCount
=======
>>>>>>> remove _ in network.js
const { getInstance } = require('../qclient');

const Network = {
  async getPeerNodeCount() {
<<<<<<< HEAD
    return await (getInstance().getPeerInfo()).length || 0;
=======
    return getInstance().getPeerInfo().length || 0;
>>>>>>> update and change to peerNodeCount
  },
};

module.exports = Network;
