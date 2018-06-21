const _ = require('lodash');

const BodhiServer = require('./server');
const ServerConfig = require('./config');
const Constants = require('./constants');
const { initDB, deleteBodhiData } = require('./db');
const Utils = require('./utils');
const EmitterHelper = require('./utils/emitterHelper');
const { getLogger } = require('./utils/logger');
const AddressManager = require('./api/address_manager');
const BaseContract = require('./api/base_contract');
const Blockchain = require('./api/blockchain');
const BodhiToken = require('./api/bodhi_token');
const CentralizedOracle = require('./api/centralized_oracle');
const DecentralizedOracle = require('./api/decentralized_oracle');
const EventFactory = require('./api/event_factory');
const Oracle = require('./api/oracle');
const QtumUtils = require('./api/qtum_utils');
const TopicEvent = require('./api/topic_event');
const Transaction = require('./api/transaction');
const Wallet = require('./api/wallet');

if (_.includes(process.argv, '--testnet')) {
  startServer(Constants.blockchainEnv.TESTNET, Utils.getDevQtumExecPath());
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(Constants.blockchainEnv.MAINNET, Utils.getDevQtumExecPath());
} else {
  console.log('testnet/mainnet flag not found. startServer() will need to be called explicitly.');
}

module.exports = {
  BodhiServer,
  ServerConfig,
  Constants,
  initDB,
  deleteBodhiData,
  Utils,
  EmitterHelper,
  getLogger,
  AddressManager,
  BaseContract,
  Blockchain,
  BodhiToken,
  CentralizedOracle,
  DecentralizedOracle,
  EventFactory,
  Oracle,
  QtumUtils,
  TopicEvent,
  Transaction,
  Wallet,
};
