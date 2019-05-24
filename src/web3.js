const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV } = require('./constants');
const { logger } = require('./utils/logger');

let url;
if (CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET) {
  url = CONFIG.RPC_MAINNET;
  logger().info('Web3 connected to Mainnet');
} else {
  url = CONFIG.RPC_TESTNET;
  logger().info('Web3 connected to Testnet');
}

module.exports = new Web3(url);
