/* eslint no-underscore-dangle: 0 */
const { isFinite, isString } = require('lodash');
const { TX_TYPE } = require('../constants');
const { toLowerCase } = require('../utils');

module.exports = class ResultSet {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.txid)) throw Error('txid must be a String');
    if (!isString(params.txStatus)) throw Error('txStatus must be a String');
    if (!isString(params.eventAddress)) throw Error('eventAddress must be a String');
    if (!isFinite(params.resultIndex)) throw Error('resultIndex must be a Number');
    if (!isString(params.amount)) throw Error('amount must be a String');
    if (!isFinite(params.eventRound)) throw Error('eventRound must be a Number');
  }

  format(params) {
    // Chain params
    this.txType = TX_TYPE.RESULT_SET;
    this.txid = toLowerCase(params.txid);
    this.txStatus = params.txStatus;
    this.blockNum = params.blockNum;

    // Result Set params
    this.eventAddress = toLowerCase(params.eventAddress);
    this.centralizedOracleAddress = toLowerCase(params.centralizedOracleAddress);
    this.resultIndex = params.resultIndex;
    this.amount = params.amount;
    this.eventRound = params.eventRound;
    this.nextConsensusThreshold = params.nextConsensusThreshold;
    this.nextArbitrationEndTime = params.nextArbitrationEndTime;
  }
};
