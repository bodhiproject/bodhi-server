const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV } = require('./constants');

let web3;

const initWeb3 = () => {
  if (!web3) {
    if (CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET) {
      web3 = new Web3(CONFIG.RPC_MAINNET);
    } else {
      web3 = new Web3(CONFIG.RPC_TESTNET);
    }
  }
};

module.exports = {
  initWeb3,
  web3,
};
