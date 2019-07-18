const { assert } = require('chai');
const { isUndefined, isFinite, isString, map, filter } = require('lodash');
const web3 = require('../../src/web3');
const MultipleResultsEvent = require('../../src/models/multiple-results-event');
const { TX_STATUS } = require('../../src/constants');

/**
The following fields are not validating in model
  address
  version
  escrowAmount
  arbitrationLength
  thresholdPercentIncrease
  arbitrationRewardPercentage
  consensusThreshold
  arbitrationEndTime
  results **
*/

const results = ['Invalid', '1', 'y'];
const rawInput = {
  txid: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
  txStatus: TX_STATUS.SUCCESS,
  blockNum: 5,
  address: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
  ownerAddress: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
  version: 6,
  name: 'Test',
  results: map(results, item => web3.utils.utf8ToHex(item)),
  numOfResults: 3,
  centralizedOracle: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
  betStartTime: 1560965704,
  betEndTime: 1560965704,
  resultSetStartTime: 1560965704,
  resultSetEndTime: 1560965704,
  escrowAmount: '1000000',
  arbitrationLength: 172800,
  thresholdPercentIncrease: '10',
  arbitrationRewardPercentage: 10,
  consensusThreshold: '100000000000',
  arbitrationEndTime: 1560965704,
};

describe('models/multiple-results-event', () => {
  describe('validate', () => {
    let input;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);
    });

    it('It should throw if txid is null', () => {
      input.txid = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txid must be a String');
    });

    it('It should throw if txid is undefined', () => {
      input.txid = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txid must be a String');
    });

    it('It should throw if txid is number', () => {
      input.txid = 12;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txid must be a String');
    });

    it('It should throw if txid is array', () => {
      input.txid = ['0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428'];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txid must be a String');
    });

    it('It should throw if txid is object', () => {
      input.txid = { id: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428' };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txid must be a String');
    });

    it('It should throw if txStatus is null', () => {
      input.txStatus = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txStatus must be a String');
    });

    it('It should throw if txStatus is undefined', () => {
      input.txStatus = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txStatus must be a String');
    });

    it('It should throw if txStatus is number', () => {
      input.txStatus = 12;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txStatus must be a String');
    });

    it('It should throw if txStatus is array', () => {
      input.txStatus = [TX_STATUS.SUCCESS];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txStatus must be a String');
    });

    it('It should throw if txStatus is object', () => {
      input.txStatus = { id: TX_STATUS.SUCCESS };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'txStatus must be a String');
    });

    it('It should throw if ownerAddress is null', () => {
      input.ownerAddress = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'ownerAddress must be a String');
    });

    it('It should throw if ownerAddress is undefined', () => {
      input.ownerAddress = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'ownerAddress must be a String');
    });

    it('It should throw if ownerAddress is number', () => {
      input.ownerAddress = 12;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'ownerAddress must be a String');
    });

    it('It should throw if ownerAddress is array', () => {
      input.ownerAddress = ['0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428'];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'ownerAddress must be a String');
    });

    it('It should throw if ownerAddress is object', () => {
      input.ownerAddress = { id: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428' };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'ownerAddress must be a String');
    });

    it('It should throw if name is null', () => {
      input.name = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'name must be a String');
    });

    it('It should throw if name is undefined', () => {
      input.name = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'name must be a String');
    });

    it('It should throw if name is number', () => {
      input.name = 12;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'name must be a String');
    });

    it('It should throw if name is array', () => {
      input.name = ['0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428'];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'name must be a String');
    });

    it('It should throw if name is object', () => {
      input.name = { id: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428' };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'name must be a String');
    });

    it('It should throw if centralizedOracle is null', () => {
      input.centralizedOracle = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'centralizedOracle must be a String');
    });

    it('It should throw if centralizedOracle is undefined', () => {
      input.centralizedOracle = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'centralizedOracle must be a String');
    });

    it('It should throw if centralizedOracle is number', () => {
      input.centralizedOracle = 12;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'centralizedOracle must be a String');
    });

    it('It should throw if centralizedOracle is array', () => {
      input.centralizedOracle = ['0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428'];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'centralizedOracle must be a String');
    });

    it('It should throw if centralizedOracle is object', () => {
      input.centralizedOracle = { id: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428' };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'centralizedOracle must be a String');
    });

    it('It should throw if numOfResults is null', () => {
      input.numOfResults = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'numOfResults must be a Number');
    });

    it('It should throw if numOfResults is undefined', () => {
      input.numOfResults = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'numOfResults must be a Number');
    });

    it('It should throw if numOfResults is string', () => {
      input.numOfResults = '12';
      assert.throws(() => new MultipleResultsEvent(input), Error, 'numOfResults must be a Number');
    });

    it('It should throw if numOfResults is array', () => {
      input.numOfResults = [2];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'numOfResults must be a Number');
    });

    it('It should throw if numOfResults is object', () => {
      input.numOfResults = { id: 2 };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'numOfResults must be a Number');
    });

    it('It should throw if betEndTime is null', () => {
      input.betEndTime = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betEndTime must be a Number');
    });

    it('It should throw if betEndTime is undefined', () => {
      input.betEndTime = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betEndTime must be a Number');
    });

    it('It should throw if betEndTime is string', () => {
      input.betEndTime = '12';
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betEndTime must be a Number');
    });

    it('It should throw if betEndTime is array', () => {
      input.betEndTime = [2];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betEndTime must be a Number');
    });

    it('It should throw if betEndTime is object', () => {
      input.betEndTime = { id: 2 };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betEndTime must be a Number');
    });

    it('It should throw if resultSetStartTime is null', () => {
      input.resultSetStartTime = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetStartTime must be a Number');
    });

    it('It should throw if resultSetStartTime is undefined', () => {
      input.resultSetStartTime = undefined;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetStartTime must be a Number');
    });

    it('It should throw if resultSetStartTime is string', () => {
      input.resultSetStartTime = '12';
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetStartTime must be a Number');
    });

    it('It should throw if resultSetStartTime is array', () => {
      input.resultSetStartTime = [2];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetStartTime must be a Number');
    });

    it('It should throw if resultSetStartTime is object', () => {
      input.resultSetStartTime = { id: 2 };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetStartTime must be a Number');
    });

    it('It should throw if betStartTime is null', () => {
      input.betStartTime = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betStartTime must be a Number');
    });

    it('It should throw if betStartTime is string', () => {
      input.betStartTime = '12';
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betStartTime must be a Number');
    });

    it('It should throw if betStartTime is array', () => {
      input.betStartTime = [2];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betStartTime must be a Number');
    });

    it('It should throw if betStartTime is object', () => {
      input.betStartTime = { id: 2 };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'betStartTime must be a Number');
    });

    it('It should throw if resultSetEndTime is null', () => {
      input.resultSetEndTime = null;
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetEndTime must be a Number');
    });

    it('It should throw if resultSetEndTime is string', () => {
      input.resultSetEndTime = '12';
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetEndTime must be a Number');
    });

    it('It should throw if resultSetEndTime is array', () => {
      input.resultSetEndTime = [2];
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetEndTime must be a Number');
    });

    it('It should throw if resultSetEndTime is object', () => {
      input.resultSetEndTime = { id: 2 };
      assert.throws(() => new MultipleResultsEvent(input), Error, 'resultSetEndTime must be a Number');
    });
  });

  describe('format', () => {
    let input;
    let mutationInput;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);

      mutationInput = {
        txid: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        txStatus: TX_STATUS.SUCCESS,
        blockNum: 5,
        address: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        ownerAddress: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        version: 6,
        name: 'Test',
        numOfResults: 3,
        centralizedOracle: '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
        betEndTime: 1560965704,
        resultSetStartTime: 1560965704,
        escrowAmount: '1000000',
        arbitrationLength: 172800,
        thresholdPercentIncrease: '10',
        arbitrationRewardPercentage: 10,
        consensusThreshold: '100000000000',
        arbitrationEndTime: 1560965704,
      };
      mutationInput.results = input.results;
    });

    it('it should format synced input', () => {
      const event = new MultipleResultsEvent(input);
      assert.equal(event.txid, input.txid);
      assert.equal(event.txStatus, input.txStatus);
      assert.equal(event.blockNum, input.blockNum);
      assert.equal(event.address, input.address);
      assert.equal(event.ownerAddress, input.ownerAddress);
      assert.equal(event.version, input.version);
      assert.equal(event.name, input.name);
      assert.deepEqual(event.results, results);
      assert.equal(event.numOfResults, input.numOfResults);
      assert.equal(event.centralizedOracle, input.centralizedOracle);
      assert.equal(event.betStartTime, input.betStartTime);
      assert.equal(event.betEndTime, input.betEndTime);
      assert.equal(event.resultSetStartTime, input.resultSetStartTime);
      assert.equal(event.resultSetEndTime, input.resultSetEndTime);
      assert.equal(event.escrowAmount, input.escrowAmount);
      assert.equal(event.arbitrationLength, input.arbitrationLength);
      assert.equal(event.thresholdPercentIncrease, input.thresholdPercentIncrease);
      assert.equal(event.arbitrationRewardPercentage, input.arbitrationRewardPercentage);
      assert.isString(event.consensusThreshold);
      assert.isNumber(event.arbitrationEndTime);
    });

    it('It should format mutation input', () => {
      const event = new MultipleResultsEvent(mutationInput);
      assert.equal(event.txid, input.txid);
      assert.equal(event.txStatus, input.txStatus);
      assert.equal(event.blockNum, input.blockNum);
      assert.equal(event.address, input.address);
      assert.equal(event.ownerAddress, input.ownerAddress);
      assert.equal(event.version, input.version);
      assert.equal(event.name, input.name);
      assert.deepEqual(event.results, results);
      assert.equal(event.numOfResults, input.numOfResults);
      assert.equal(event.centralizedOracle, input.centralizedOracle);
      assert.isUndefined(event.betStartTime);
      assert.equal(event.betEndTime, input.betEndTime);
      assert.equal(event.resultSetStartTime, input.resultSetStartTime);
      assert.isUndefined(event.resultSetEndTime);
      assert.equal(event.escrowAmount, input.escrowAmount);
      assert.equal(event.arbitrationLength, input.arbitrationLength);
      assert.equal(event.thresholdPercentIncrease, input.thresholdPercentIncrease);
      assert.equal(event.arbitrationRewardPercentage, input.arbitrationRewardPercentage);
      assert.isString(event.consensusThreshold);
      assert.isNumber(event.arbitrationEndTime);
    });

    it('It should format the txid to be lowercase', () => {
      input.txid = input.txid.toUpperCase();
      const event = new MultipleResultsEvent(input);
      assert.equal(event.txid, input.txid.toLowerCase());
    });

    it('It should format the address to be lowercase', () => {
      input.address = input.address.toUpperCase();
      const event = new MultipleResultsEvent(input);
      assert.equal(event.address, input.address.toLowerCase());
    });

    it('It should format the ownerAddress to be lowercase', () => {
      input.ownerAddress = input.ownerAddress.toUpperCase();
      const event = new MultipleResultsEvent(input);
      assert.equal(event.ownerAddress, input.ownerAddress.toLowerCase());
    });

    it('It should format the centralizedOracle to be lowercase', () => {
      input.centralizedOracle = input.centralizedOracle.toUpperCase();
      const event = new MultipleResultsEvent(input);
      assert.equal(event.centralizedOracle, input.centralizedOracle.toLowerCase());
    });
  });
});
