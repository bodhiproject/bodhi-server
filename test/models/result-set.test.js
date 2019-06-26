const { assert } = require('chai');
const { isUndefined, isFinite, isString, map, filter } = require('lodash');
const web3 = require('../../src/web3');
const ResultSet = require('../../src/models/result-set');
const { TX_STATUS, TX_TYPE } = require('../../src/constants');

// result-set model not validating on
// 1. centralizedOracleAddress
// 2. nextConsensusThreshold
// 3. nextArbitrationEndTime

describe('models/result-set', () => {
  describe('validate', () => {
    let input;

    beforeEach(() => {
      input = {
        txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        txStatus: TX_STATUS.SUCCESS,
        blockNum: 5,
        eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        resultIndex: 1,
        amount: "1000000",
        eventRound: 0,
      };
    });

    it('It should throw if txid is missing', () => {
      delete input.txid;
      assert.throws(() => new ResultSet(input), Error, "txid must be a String"); // must be double quotes
    });

    it('It should throw if txid is null', () => {
      input.txid = null;
      assert.throws(() => new ResultSet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is undefined', () => {
      input.txid = undefined;
      assert.throws(() => new ResultSet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is number', () => {
      input.txid = 12;
      assert.throws(() => new ResultSet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is array', () => {
      input.txid = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new ResultSet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is object', () => {
      input.txid = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new ResultSet(input), Error, "txid must be a String");
    });

    it('It should throw if txStatus is missing', () => {
      delete input.txStatus;
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is null', () => {
      input.txStatus = null;
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is undefined', () => {
      input.txStatus = undefined;
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is number', () => {
      input.txStatus = 12;
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is array', () => {
      input.txStatus = [TX_STATUS.SUCCESS];
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is object', () => {
      input.txStatus = {id:TX_STATUS.SUCCESS};
      assert.throws(() => new ResultSet(input), Error, "txStatus must be a String");
    });

    it('It should throw if amount is missing', () => {
      delete input.amount;
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is null', () => {
      input.amount = null;
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is undefined', () => {
      input.amount = undefined;
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is number', () => {
      input.amount = 12;
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is array', () => {
      input.amount = ["100000"];
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is object', () => {
      input.amount = {id:"100000"};
      assert.throws(() => new ResultSet(input), Error, "amount must be a String");
    });

    it('It should throw if eventAddress is missing', () => {
      delete input.eventAddress;
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is null', () => {
      input.eventAddress = null;
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is undefined', () => {
      input.eventAddress = undefined;
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is number', () => {
      input.eventAddress = 12;
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is array', () => {
      input.eventAddress = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is object', () => {
      input.eventAddress = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new ResultSet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if resultIndex is missing', () => {
      delete input.resultIndex;
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is null', () => {
      input.resultIndex = null;
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is undefined', () => {
      input.resultIndex = undefined;
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is string', () => {
      input.resultIndex = "12";
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is array', () => {
      input.resultIndex = [2];
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is object', () => {
      input.resultIndex = {id:2};
      assert.throws(() => new ResultSet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if eventRound is missing', () => {
      delete input.eventRound;
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is null', () => {
      input.eventRound = null;
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is undefined', () => {
      input.eventRound = undefined;
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is string', () => {
      input.eventRound = "12";
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is array', () => {
      input.eventRound = [2];
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is object', () => {
      input.eventRound = {id:2};
      assert.throws(() => new ResultSet(input), Error, "eventRound must be a Number");
    });
  });

  describe('format', () => {
    let input;

    beforeEach(() => {
      input = {
        txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        txStatus: TX_STATUS.SUCCESS,
        blockNum: 5,
        eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        resultIndex: 1,
        amount: "1000000",
        eventRound: 0,
      };
    });

    it('It should format all the fields mimicing pending result-set', () => {
      const resultSet = new ResultSet(input);
      assert.equal(resultSet.txid, input.txid);
      assert.equal(resultSet.txStatus, input.txStatus);
      assert.equal(resultSet.blockNum, input.blockNum);
      assert.equal(resultSet.eventAddress, input.eventAddress);
      assert.equal(resultSet.resultIndex, input.resultIndex);
      assert.equal(resultSet.amount, input.amount);
      assert.equal(resultSet.eventRound, input.eventRound);
      assert.equal(resultSet.txType, TX_TYPE.RESULT_SET);
    });

    it('It should format the eventAddress to lowercase mimicing pending result-set', () => {
      input.eventAddress = input.eventAddress.toUpperCase();
      const resultSet = new ResultSet(input);
      assert.equal(resultSet.txid, input.txid);
      assert.equal(resultSet.txStatus, input.txStatus);
      assert.equal(resultSet.blockNum, input.blockNum);
      assert.equal(resultSet.eventAddress, input.eventAddress.toLowerCase());
      assert.equal(resultSet.resultIndex, input.resultIndex);
      assert.equal(resultSet.amount, input.amount);
      assert.equal(resultSet.eventRound, input.eventRound);
      assert.equal(resultSet.txType, TX_TYPE.RESULT_SET);
    });

    it('It should format all the fields mimicing synced result-set', () => {
      input.centralizedOracleAddress = "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428";
      input.nextConsensusThreshold = "10";
      input.nextArbitrationEndTime = 10;
      const resultSet = new ResultSet(input);
      assert.equal(resultSet.txid, input.txid);
      assert.equal(resultSet.txStatus, input.txStatus);
      assert.equal(resultSet.blockNum, input.blockNum);
      assert.equal(resultSet.eventAddress, input.eventAddress);
      assert.equal(resultSet.resultIndex, input.resultIndex);
      assert.equal(resultSet.amount, input.amount);
      assert.equal(resultSet.eventRound, input.eventRound);
      assert.equal(resultSet.txType, TX_TYPE.RESULT_SET);
      assert.equal(resultSet.centralizedOracleAddress, input.centralizedOracleAddress);
      assert.equal(resultSet.nextConsensusThreshold, input.nextConsensusThreshold);
      assert.equal(resultSet.nextArbitrationEndTime, input.nextArbitrationEndTime);
    });

    it('It should format centralizedOracleAddress to lowercase mimicing synced result-set', () => {
      input.centralizedOracleAddress = "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428".toUpperCase();
      input.nextConsensusThreshold = "10";
      input.nextArbitrationEndTime = 10;
      const resultSet = new ResultSet(input);
      assert.equal(resultSet.txid, input.txid);
      assert.equal(resultSet.txStatus, input.txStatus);
      assert.equal(resultSet.blockNum, input.blockNum);
      assert.equal(resultSet.eventAddress, input.eventAddress);
      assert.equal(resultSet.resultIndex, input.resultIndex);
      assert.equal(resultSet.amount, input.amount);
      assert.equal(resultSet.eventRound, input.eventRound);
      assert.equal(resultSet.txType, TX_TYPE.RESULT_SET);
      assert.equal(resultSet.centralizedOracleAddress, input.centralizedOracleAddress.toLowerCase());
      assert.equal(resultSet.nextConsensusThreshold, input.nextConsensusThreshold);
      assert.equal(resultSet.nextArbitrationEndTime, input.nextArbitrationEndTime);
    });
  });
});
