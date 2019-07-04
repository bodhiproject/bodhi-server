const { isNull, isUndefined, map } = require('lodash');
const { multipleResultsEventMeta } = require('../config');
const web3 = require('../web3');
const logger = require('../utils/logger');
const DBHelper = require('../db/db-helper');

const getContract = async (eventAddress) => {
  const event = await DBHelper.findOneEvent({ address: eventAddress });
  if (isNull(event)) throw Error('Event not found');

  const metadata = multipleResultsEventMeta(event.version);
  return new web3.eth.Contract(metadata.abi, eventAddress);
};

module.exports = {
  getContract,

  async calculateWinnings(args) {
    try {
      const { eventAddress, address } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');
      if (isUndefined(address)) throw TypeError('address is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.calculateWinnings(address).call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.calculateWinnings(): ${err.message}`);
      throw err;
    }
  },

  async version(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.version().call();
      return web3.utils.toBN(res).toNumber();
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.version(): ${err.message}`);
      throw err;
    }
  },

  async currentRound(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.currentRound().call();
      return web3.utils.toBN(res).toNumber();
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.currentRound(): ${err.message}`);
      throw err;
    }
  },

  async currentResultIndex(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.currentResultIndex().call();
      return web3.utils.toBN(res).toNumber();
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.currentResultIndex(): ${err.message}`);
      throw err;
    }
  },

  async currentConsensusThreshold(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.currentConsensusThreshold().call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.currentConsensusThreshold(): ${err.message}`);
      throw err;
    }
  },

  async currentArbitrationEndTime(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.currentArbitrationEndTime().call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.currentArbitrationEndTime(): ${err.message}`);
      throw err;
    }
  },

  async eventMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const { utils: { toBN, hexToUtf8 } } = web3;
      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.eventMetadata().call();
      return [
        toBN(res[0]).toNumber(),
        res[1],
        map(res[2], item => hexToUtf8(item)),
        toBN(res[3]).toNumber(),
      ];
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.eventMetadata(): ${err.message}`);
      throw err;
    }
  },

  async centralizedMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const { utils: { toBN } } = web3;
      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.centralizedMetadata().call();
      return [
        res[0],
        web3.utils.toBN(res[1]).toString(10),
        toBN(res[2]).toString(10),
        toBN(res[3]).toString(10),
        toBN(res[4]).toString(10),
      ];
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.centralizedMetadata(): ${err.message}`);
      throw err;
    }
  },

  async configMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const { utils: { toBN } } = web3;
      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.configMetadata().call();
      return [
        toBN(res[0]).toString(10),
        toBN(res[1]).toString(10),
        toBN(res[2]).toString(10),
        toBN(res[3]).toString(10),
      ];
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.configMetadata(): ${err.message}`);
      throw err;
    }
  },

  async totalBets(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      const res = await contract.methods.totalBets().call();
      return web3.utils.toBN(res).toString(10);
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.totalBets(): ${err.message}`);
      throw err;
    }
  },

  async didWithdraw(args) {
    try {
      const { eventAddress, address } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');
      if (isUndefined(address)) throw TypeError('address is not defined');

      const contract = await this.getContract(eventAddress);
      return contract.methods.didWithdraw(address).call();
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.didWithdraw(): ${err.message}`);
      throw err;
    }
  },

  async didWithdrawEscrow(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const contract = await this.getContract(eventAddress);
      return contract.methods.didWithdrawEscrow().call();
    } catch (err) {
      logger.error(`Error MultipleResultsEvent.didWithdrawEscrow(): ${err.message}`);
      throw err;
    }
  },
};
