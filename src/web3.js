const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV } = require('./constants');
const logger = require('./utils/logger');
const emitter = require('./event');

// Get endpoint per network
let url;
let msg;
if (CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET) {
  url = CONFIG.WS_PROVIDER_MAINNET;
  msg = 'Web3 connected to Mainnet';
} else {
  url = CONFIG.WS_PROVIDER_TESTNET;
  msg = 'Web3 connected to Testnet';
}

// Create provider and handle events
const provider = new Web3.providers.WebsocketProvider(url);
provider.on('connect', () => logger.info(msg));
provider.on('error', (err) => {
  logger.error(`Web3 WS encountered an error: ${err.message}`);
  throw err;
});
provider.on('end', () => {
  logger.error('Web3 WS disconnected');
  throw Error('Web3 WS disconnected');
});

module.exports = new Web3(provider);
