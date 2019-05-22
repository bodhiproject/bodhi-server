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
    if (!isString(params.eventAddress)) throw Error('eventAddress must be a String');
    if (!isString(params.betterAddress)) throw Error('betterAddress must be a String');
    if (!isFinite(params.resultIndex)) throw Error('resultIndex must be a Number');
    if (!isString(params.amount)) throw Error('amount must be a String');
    if (!isFinite(params.eventRound)) throw Error('eventRound must be a Number');
  }

  format(params) {
    // Chain params
    this.txType = Number(params.eventRound) === 0 ? TX_TYPE.BET : TX_TYPE.VOTE;
    this.txid = params.txid.toLowerCase();
    this.txStatus = params.txStatus;
    this.blockNum = params.blockNum;

    // Bet params
    this.eventAddress = params.eventAddress.toLowerCase();
    this.betterAddress = params.betterAddress.toLowerCase();
    this.resultIndex = params.resultIndex;
    this.amount = params.amount.toString(10);
    this.eventRound = params.eventRound;
  }
};
