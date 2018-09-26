const { Config } = require('../config');
const Utils = require('../utils');
const { db } = require('../db');
const { TX_TYPE } = require('../constants');

const DEFAULT_GAS_COST = formatGasCost(Config.DEFAULT_GAS_LIMIT * Config.DEFAULT_GAS_PRICE);
const {
  APPROVECREATEEVENT,
  CREATEEVENT,
  BET,
  APPROVESETRESULT,
  SETRESULT,
  APPROVEVOTE,
  VOTE,
  TRANSFER,
} = TX_TYPE;

function formatGasCost(gasCost) {
  return gasCost.toFixed(2);
}

const Transaction = {
  /**
   * Returns the transaction costs and gas usage for an action.
   * @param {object} args Arguments for getting the tx costs.
   * @return {array} Array of tx costs.
   */
  async transactionCost(args) {
    const {
      type, // string
      token, // string
      amount, // number
      optionIdx, // number
      topicAddress, // address
      oracleAddress, // address
      senderAddress, // address
    } = args;

    if (!type) {
      throw TypeError('type needs to be defined');
    }
    if (!senderAddress) {
      throw TypeError('senderAddress needs to be defined');
    }
    if ((type === APPROVECREATEEVENT
      || type === BET
      || type === APPROVESETRESULT
      || type === APPROVEVOTE
      || type === TRANSFER)
      && (!token || !amount)) {
      throw TypeError('token and amount need to be defined');
    }
    if ((type === APPROVESETRESULT || type === APPROVEVOTE) && !topicAddress) {
      throw TypeError('topicAddress needs to be defined');
    }
    if (type === APPROVEVOTE && !oracleAddress) {
      throw TypeError('oracleAddress needs to be defined');
    }

    let gasLimit = Config.DEFAULT_GAS_LIMIT;
    let gasCost = DEFAULT_GAS_COST;
    if (type === CREATEEVENT) {
      gasLimit = Config.CREATE_CORACLE_GAS_LIMIT;
      gasCost = formatGasCost(Config.CREATE_CORACLE_GAS_LIMIT * Config.DEFAULT_GAS_PRICE);
    } else if (type === SETRESULT) {
      gasLimit = Config.CREATE_DORACLE_GAS_LIMIT;
      gasCost = formatGasCost(Config.CREATE_DORACLE_GAS_LIMIT * Config.DEFAULT_GAS_PRICE);
    } else if (type === VOTE) {
      gasLimit = await Utils.getVotingGasLimit(db.Oracles, oracleAddress, optionIdx, amount);
      gasCost = formatGasCost(gasLimit * Config.DEFAULT_GAS_PRICE);
    }

    const costsArr = [{ type, gasLimit, gasCost, token, amount }];
    return costsArr;
  },
};

module.exports = Transaction;
