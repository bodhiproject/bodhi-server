const _ = require('lodash');

const {
  getQtumProcess, killQtumProcess, startServices, startServer, getServer, startQtumWallet,
} = require('./server');
const { Config, setQtumEnv, getQtumExplorerUrl } = require('./config');
const Constants = require('./constants');
const { initDB, deleteBodhiData } = require('./db/nedb');
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
  getQtumProcess,
  killQtumProcess,
  startServices,
  startServer,
  getServer,
  startQtumWallet,
  Config,
  setQtumEnv,
  getQtumExplorerUrl,
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
