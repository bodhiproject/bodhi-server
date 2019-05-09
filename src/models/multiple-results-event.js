/* eslint no-underscore-dangle: 0 */
const { isFinite, isString, map, filter } = require('lodash');

const { INVALID_RESULT_INDEX, STATUS } = require('../constants');
const { web3 } = require('../web3');

class MultipleResultsEvent {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isFinite(params.blockNum)) throw Error('blockNum must be a Number');
    if (!isString(params.txid)) throw Error('txid must be a String');
  }

  format(params) {
    // Chain params
    this.blockNum = params.blockNum;
    this.txid = params.txid;

    // Blockchain params
    this.address = params.address;
    this.owner = params.owner;
    this.version = params.version;
    this.name = params.name;
    this.results = filter(
      map(params.results, item => web3().utils.toAscii(item)),
      item => !!item,
    );
    this.numOfResults = params.numOfResults;
    this.centralizedOracle = params.centralizedOracle;
    this.betStartTime = params.betStartTime.toString(10);
    this.betEndTime = params.betEndTime.toString(10);
    this.resultSetStartTime = params.resultSetStartTime.toString(10);
    this.resultSetEndTime = params.resultSetEndTime.toString(10);
    this.escrowAmount = params.escrowAmount.toString(10);
    this.arbitrationLength = params.arbitrationLength.toString(10);
    this.thresholdPercentIncrease = params.thresholdPercentIncrease.toString(10);
    this.arbitrationRewardPercentage = params.arbitrationRewardPercentage.toString(10);
    this.currentRound = 0;
    this.currentResultIndex = INVALID_RESULT_INDEX;

    // Backend params
    this.hashId = null;
    this.status = STATUS.VOTING;
    this.language = 'zh-Hans-CN';
  }
}

module.exports = MultipleResultsEvent;
