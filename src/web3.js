const Web3 = require('web3');
const net = require('net');
const { CONFIG, isMainnet } = require('./config');
const { EVENT_MESSAGE, WEB3_PROVIDER } = require('./constants');
const logger = require('./utils/logger');
const emitter = require('./event');

/**
 * Returns a Web3 IPC provider.
 * @return {IpcProvider} Web3 provider
 */
const getIpcProvider = () => {
  let uri;
  let msg;
  if (isMainnet()) {
    uri = CONFIG.IPC_PROVIDER_MAINNET;
    msg = 'Web3 IPC connected to Mainnet';
  } else {
    uri = CONFIG.IPC_PROVIDER_TESTNET;
    msg = 'Web3 IPC connected to Testnet';
  }

  const provider = new Web3.providers.IpcProvider(uri, net);
  logger.info(msg);
  return provider;
};

/**
 * Returns a Web3 WS provider.
 * @return {WebsocketProvider} Web3 provider
 */
const getWsProvider = () => {
  let uri;
  let msg;
  if (isMainnet()) {
    uri = CONFIG.WS_PROVIDER_MAINNET;
    msg = 'Web3 WS connected to Mainnet';
  } else {
    uri = CONFIG.WS_PROVIDER_TESTNET;
    msg = 'Web3 WS connected to Testnet';
  }

  const provider = new Web3.providers.WebsocketProvider(uri);
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

/**
 * Returns a Web3 HTTP provider.
 * @return {IpcProvider} Web3 provider
 */
const getHttpProvider = () => {
  let uri;
  let msg;
  if (isMainnet()) {
    uri = CONFIG.HTTP_PROVIDER_MAINNET;
    msg = 'Web3 HTTP connected to Mainnet';
  } else {
    uri = CONFIG.HTTP_PROVIDER_TESTNET;
    msg = 'Web3 HTTP connected to Testnet';
  }

  const provider = new Web3.providers.HttpProvider(uri);
  logger.info(msg);
  return provider;
};

let web3;
switch (CONFIG.PROVIDER) {
  case WEB3_PROVIDER.WS: {
    web3 = new Web3(getWsProvider());
    break;
  }
  case WEB3_PROVIDER.HTTP: {
    web3 = new Web3(getHttpProvider());
    break;
  }
  default: {
    web3 = new Web3(getIpcProvider());
    break;
  }
}

module.exports = web3;
