const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV } = require('./constants');
const { logger } = require('./utils/logger');

let instance;

const initWeb3 = () => {
  if (!instance) {
    if (CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET) {
      instance = new Web3(CONFIG.RPC_MAINNET);
      logger().info('Web3 connected to Mainnet');
    } else {
      instance = new Web3(CONFIG.RPC_TESTNET);
      logger().info('Web3 connected to Testnet');
    }
  }
};

const web3 = () => instance;

module.exports = {
  initWeb3,
  web3,
};
