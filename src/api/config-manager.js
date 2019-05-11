const { isUndefined } = require('lodash');

const { getContractMetadata, CONFIG } = require('../config');
const { BLOCKCHAIN_ENV } = require('../constants');
const { web3 } = require('../web3');
const { getLogger } = require('../utils/logger');

function getContract() {
  const metadata = getContractMetadata().ConfigManager;
  const address = CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? metadata.mainnet : metadata.testnet;
  const naka = web3();
  return new naka.eth.Contract(metadata.abi, address);
}

module.exports = {
  async bodhiTokenAddress() {
    try {
      return getContract().methods.bodhiTokenAddress().call();
    } catch (err) {
      getLogger().error(`Error ConfigManager.bodhiTokenAddress(): ${err.message}`);
      throw err;
    }
  },

  async eventFactoryAddress() {
    try {
      return getContract().methods.eventFactoryAddress().call();
    } catch (err) {
      getLogger().error(`Error ConfigManager.eventFactoryAddress(): ${err.message}`);
      throw err;
    }
  },

  async eventEscrowAmount() {
    try {
      const res = await getContract().methods.eventEscrowAmount().call();
      return res.toString(10);
    } catch (err) {
      getLogger().error(`Error ConfigManager.eventEscrowAmount(): ${err.message}`);
      throw err;
    }
  },

  async arbitrationLength() {
    try {
      const res = await getContract().methods.arbitrationLength().call();
      return res.toString(10);
    } catch (err) {
      getLogger().error(`Error ConfigManager.arbitrationLength(): ${err.message}`);
      throw err;
    }
  },

  async arbitrationRewardPercentage() {
    try {
      const res = await getContract().methods.arbitrationRewardPercentage().call();
      return res.toString(10);
    } catch (err) {
      getLogger().error(`Error ConfigManager.arbitrationRewardPercentage(): ${err.message}`);
      throw err;
    }
  },

  async startingOracleThreshold() {
    try {
      const res = await getContract().methods.startingOracleThreshold().call();
      return res.toString(10);
    } catch (err) {
      getLogger().error(`Error ConfigManager.startingOracleThreshold(): ${err.message}`);
      throw err;
    }
  },

  async thresholdPercentIncrease() {
    try {
      const res = await getContract().methods.thresholdPercentIncrease().call();
      return res.toString(10);
    } catch (err) {
      getLogger().error(`Error ConfigManager.thresholdPercentIncrease(): ${err.message}`);
      throw err;
    }
  },

  async isWhitelisted(args) {
    try {
      const { address } = args;
      if (isUndefined(address)) throw TypeError('address is not defined');

      return getContract().methods.isWhitelisted(address).call();
    } catch (err) {
      getLogger().error(`Error ConfigManager.isWhitelisted(): ${err.message}`);
      throw err;
    }
  },
};