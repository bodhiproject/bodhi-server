const { isUndefined, map } = require('lodash');
const { CONFIG, configManagerMeta } = require('../config');
const { BLOCKCHAIN_ENV } = require('../constants');
const web3 = require('../web3');
const logger = require('../utils/logger');

const getContract = () => {
  const metadata = configManagerMeta(1);
  const address = CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? metadata.mainnet : metadata.testnet;
  return new web3.eth.Contract(metadata.abi, address);
};

module.exports = {
  getContract,

  async bodhiTokenAddress() {
    try {
      return this.getContract().methods.bodhiTokenAddress().call();
    } catch (err) {
      logger.error(`Error ConfigManager.bodhiTokenAddress(): ${err.message}`);
      throw err;
    }
  },

  async eventFactoryAddress() {
    try {
      return this.getContract().methods.eventFactoryAddress().call();
    } catch (err) {
      logger.error(`Error ConfigManager.eventFactoryAddress(): ${err.message}`);
      throw err;
    }
  },

  async eventEscrowAmount() {
    try {
      const res = await this.getContract().methods.eventEscrowAmount().call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error ConfigManager.eventEscrowAmount(): ${err.message}`);
      throw err;
    }
  },

  async arbitrationLength() {
    try {
      const res = await this.getContract().methods.arbitrationLength().call();
      return map(res, len => web3.utils.toBN(len).toNumber());
    } catch (err) {
      logger.error(`Error ConfigManager.arbitrationLength(): ${err.message}`);
      throw err;
    }
  },

  async startingConsensusThreshold() {
    try {
      const res = await this.getContract().methods.startingConsensusThreshold().call();
      return map(res, len => web3.utils.toBN(len).toString(10));
    } catch (err) {
      logger.error(`Error ConfigManager.startingOracleThreshold(): ${err.message}`);
      throw err;
    }
  },

  async thresholdPercentIncrease() {
    try {
      const res = await this.getContract().methods.thresholdPercentIncrease().call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error ConfigManager.thresholdPercentIncrease(): ${err.message}`);
      throw err;
    }
  },

  async isWhitelisted(args) {
    try {
      const { address } = args;
      if (isUndefined(address)) throw TypeError('address is not defined');

      return this.getContract().methods.isWhitelisted(address).call();
    } catch (err) {
      logger.error(`Error ConfigManager.isWhitelisted(): ${err.message}`);
      throw err;
    }
  },
};
