/* eslint no-underscore-dangle: 0 */
const { isFinite, isString } = require('lodash');
const { TX_TYPE } = require('../constants');

module.exports = class Bet {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.txid)) throw Error('txid must be a String');
    if (!isString(params.txStatus)) throw Error('txStatus must be a String');
    if (!isFinite(params.blockNum)) throw Error('blockNum must be a Number');
  }

  format(params) {
    // Chain params
    this.txType = Number(params.eventRound) === 0 ? TX_TYPE.BET : TX_TYPE.VOTE;
    this.txid = params.txid;
    this.txStatus = params.txStatus;
    this.blockNum = Number(params.blockNum);

    // Bet params
    this.eventAddress = params.eventAddress;
    this.betterAddress = params.betterAddress;
    this.resultIndex = Number(params.resultIndex);
    this.amount = params.amount.toString(10);
    this.eventRound = Number(params.eventRound);
  }
};
