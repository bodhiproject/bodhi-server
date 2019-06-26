const Web3 = require('web3');
const { CONFIG } = require('./config');
const { BLOCKCHAIN_ENV, EVENT_MESSAGE } = require('./constants');
const logger = require('./utils/logger');
const emitter = require('./event');

/**
 * Returns the websocket provider with implemented event handlers.
 * Event handlers will create a new provider and set it to the existing web3
 * instance when a disconnect occurs.
 * @return {WebsocketProvider} Web3 WS Provider
 */
const getProvider = () => {
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
  const provider = new Web3.providers.WebsocketProvider(url, { timeout: 30000 });
  provider.on('connect', () => {
    logger.info(msg);
    emitter.emit(EVENT_MESSAGE.WEBSOCKET_CONNECTED);
  });
  provider.on('close', (err) => {
    logger.error('Web3 WS closed', { error: err && err.message });
    emitter.emit(EVENT_MESSAGE.WEBSOCKET_DISCONNECTED);
  });
  provider.on('error', (err) => {
    logger.error('Web3 WS error', { error: err && err.message });
  });

  return provider;
};

const web3 = new Web3(getProvider());

module.exports = web3;
