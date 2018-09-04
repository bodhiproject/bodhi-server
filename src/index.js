const _ = require('lodash');

const BodhiServer = require('./server');
const BodhiConfig = require('./config');
const BodhiDb = require('./db');
const Constants = require('./constants');
const Utils = require('./utils');
const EmitterHelper = require('./utils/emitter-helper');
const { getLogger } = require('./utils/logger');
const AddressManager = require('./api/address-manager');
const BaseContract = require('./api/base-contract');
const Blockchain = require('./api/blockchain');
const BodhiToken = require('./api/bodhi-token');
const CentralizedOracle = require('./api/centralized-oracle');
const DecentralizedOracle = require('./api/decentralized-oracle');
const EventFactory = require('./api/event-factory');
const Oracle = require('./api/oracle');
const QtumUtils = require('./api/qtum-utils');
const TopicEvent = require('./api/topic-event');
const Transaction = require('./api/transaction');
const Wallet = require('./api/wallet');

const { startServer } = BodhiServer;
const { BLOCKCHAIN_ENV } = Constants;
const { getDevQtumExecPath } = Utils;
if (_.includes(process.argv, '--testnet')) {
  startServer(BLOCKCHAIN_ENV.TESTNET, getDevQtumExecPath());
} else if (_.includes(process.argv, '--mainnet')) {
  startServer(BLOCKCHAIN_ENV.MAINNET, getDevQtumExecPath());
} else {
  console.log('testnet/mainnet flag not found. startServer() will need to be called explicitly.');
}

module.exports = {
  BodhiServer,
  BodhiConfig,
  BodhiDb,
  Constants,
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
