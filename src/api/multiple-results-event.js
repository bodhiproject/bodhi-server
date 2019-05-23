const { isUndefined, map } = require('lodash');
const { getContractMetadata } = require('../config');
const { web3 } = require('../web3');
const { logger } = require('../utils/logger');

const naka = web3();
const { utils: { toBN, toAscii } } = naka;

function getContract(eventAddress) {
  const metadata = getContractMetadata().MultipleResultsEvent;
  return new naka.eth.Contract(metadata.abi, eventAddress);
}

module.exports = {
  async calculateWinnings(args) {
    try {
      const { eventAddress, address } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');
      if (isUndefined(address)) throw TypeError('address is not defined');

      const res = await getContract(eventAddress).methods.calculateWinnings()
        .call({ from: address });
      return toBN(res).toString(10);
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.calculateWinnings(): ${err.message}`);
      throw err;
    }
  },

  async version(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.version().call();
      return toBN(res).toNumber();
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.version(): ${err.message}`);
      throw err;
    }
  },

  async currentRound(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.currentRound().call();
      return toBN(res).toNumber();
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.currentRound(): ${err.message}`);
      throw err;
    }
  },

  async currentResultIndex(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.currentResultIndex().call();
      return toBN(res).toNumber();
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.currentResultIndex(): ${err.message}`);
      throw err;
    }
  },

  async currentConsensusThreshold(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.currentConsensusThreshold().call();
      return toBN(res).toString(10);
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.currentConsensusThreshold(): ${err.message}`);
      throw err;
    }
  },

  async currentArbitrationEndTime(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.currentArbitrationEndTime().call();
      return toBN(res).toString(10);
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.currentArbitrationEndTime(): ${err.message}`);
      throw err;
    }
  },

  async eventMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.eventMetadata().call();
      return [
        toBN(res[0]).toNumber(),
        res[1],
        map(res[2], item => toAscii(item)),
        toBN(res[3]).toNumber(),
      ];
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.eventMetadata(): ${err.message}`);
      throw err;
    }
  },

  async centralizedMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.centralizedMetadata().call();
      return [
        res[0],
        toBN(res[1]).toString(10),
        toBN(res[2]).toString(10),
        toBN(res[3]).toString(10),
        toBN(res[4]).toString(10),
      ];
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.centralizedMetadata(): ${err.message}`);
      throw err;
    }
  },

  async configMetadata(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.configMetadata().call();
      return [
        toBN(res[0]).toString(10),
        toBN(res[1]).toString(10),
        toBN(res[2]).toString(10),
        toBN(res[3]).toString(10),
      ];
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.configMetadata(): ${err.message}`);
      throw err;
    }
  },

  async totalBets(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      const res = await getContract(eventAddress).methods.totalBets().call();
      return toBN(res).toString(10);
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.totalBets(): ${err.message}`);
      throw err;
    }
  },

  async didWithdraw(args) {
    try {
      const { eventAddress, address } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');
      if (isUndefined(address)) throw TypeError('address is not defined');

      return getContract(eventAddress).methods.didWithdraw(address).call();
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.didWithdraw(): ${err.message}`);
      throw err;
    }
  },

  async didWithdrawEscrow(args) {
    try {
      const { eventAddress } = args;
      if (isUndefined(eventAddress)) throw TypeError('eventAddress is not defined');

      return getContract(eventAddress).methods.didWithdrawEscrow().call();
    } catch (err) {
      logger().error(`Error MultipleResultsEvent.didWithdrawEscrow(): ${err.message}`);
      throw err;
    }
  },
};
