const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV } = require('./constants');

let instance;

const initWeb3 = () => {
  if (!instance) {
    if (CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET) {
      instance = new Web3(CONFIG.RPC_MAINNET);
    } else {
      instance = new Web3(CONFIG.RPC_TESTNET);
    }
  }
};

const web3 = () => instance;

module.exports = {
  initWeb3,
  web3,
};
