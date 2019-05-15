const { isFinite, isString, map, filter } = require('lodash');
const { TX_TYPE, INVALID_RESULT_INDEX, EVENT_STATUS } = require('../constants');
const { web3 } = require('../web3');

module.exports = class MultipleResultsEvent {
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
    this.txType = TX_TYPE.CREATE_EVENT;
    this.txid = params.txid;
    this.txStatus = params.txStatus;
    this.blockNum = params.blockNum;

    // Event params
    this.address = params.address;
    this.ownerAddress = params.ownerAddress;
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
    this.consensusThreshold = params.consensusThreshold.toString(10);
    this.arbitrationEndTime = params.arbitrationEndTime.toString(10);

    // Backend params
    this.status = params.status || EVENT_STATUS.BETTING;
    this.language = params.language || 'zh-Hans-CN';
  }
};
