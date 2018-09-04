const { each, split, includes } = require('lodash');

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

// Find chain type (mainnet/testnet/regtest) from flags and start server
each(process.argv, (arg) => {
  if (arg.startsWith('--chain')) {
    const { MAINNET, TESTNET, REGTEST } = BLOCKCHAIN_ENV;
    const chain = (split(arg, '=', 2))[1];
    if (includes([MAINNET, TESTNET, REGTEST], chain)) {
      startServer(chain, getDevQtumExecPath());
    } else {
      throw Error(`Invalid type for --chain: ${chain}`);
    }
  }
});

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
