const { isFinite, isString, map, filter } = require('lodash');
const { TX_TYPE, EVENT_STATUS } = require('../constants');
const { toLowerCase } = require('../utils');
const web3 = require('../web3');

module.exports = class MultipleResultsEvent {
  constructor(params) {
    this.validate(params);
    this.format(params);
  }

  validate(params) {
    if (!isString(params.txid)) throw Error('txid must be a String');
    if (!isString(params.txStatus)) throw Error('txStatus must be a String');
    if (!isString(params.ownerAddress)) throw Error('ownerAddress must be a String');
    if (!isString(params.name)) throw Error('name must be a String');
    if (!isFinite(params.numOfResults)) throw Error('numOfResults must be a Number');
    if (!isString(params.centralizedOracle)) throw Error('centralizedOracle must be a String');
    if (!isFinite(params.betStartTime)) throw Error('betStartTime must be a Number');
    if (!isFinite(params.betEndTime)) throw Error('betEndTime must be a Number');
    if (!isFinite(params.resultSetStartTime)) throw Error('resultSetStartTime must be a Number');
    if (!isFinite(params.resultSetEndTime)) throw Error('resultSetEndTime must be a Number');
  }

  format(params) {
    // Chain params
    this.txType = TX_TYPE.CREATE_EVENT;
    this.txid = toLowerCase(params.txid);
    this.txStatus = params.txStatus;
    this.blockNum = params.blockNum;

    // Event params
    this.address = toLowerCase(params.address);
    this.ownerAddress = toLowerCase(params.ownerAddress);
    this.version = params.version;
    this.name = params.name;
    this.results = filter(
      map(params.results, item => web3.utils.hexToUtf8(item)),
      item => !!item,
    );
    this.numOfResults = params.numOfResults;
    this.centralizedOracle = toLowerCase(params.centralizedOracle);
    this.betStartTime = params.betStartTime;
    this.betEndTime = params.betEndTime;
    this.resultSetStartTime = params.resultSetStartTime;
    this.resultSetEndTime = params.resultSetEndTime;
    this.escrowAmount = params.escrowAmount;
    this.arbitrationLength = params.arbitrationLength;
    this.thresholdPercentIncrease = params.thresholdPercentIncrease;
    this.arbitrationRewardPercentage = params.arbitrationRewardPercentage;

    // Backend params
    this.status = params.status || EVENT_STATUS.BETTING;
    this.language = params.language || 'zh-Hans-CN';
  }
};
