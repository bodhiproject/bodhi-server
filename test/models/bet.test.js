const { assert } = require('chai');
const { isUndefined, isFinite, isString, map, filter } = require('lodash');
const web3 = require('../../src/web3');
const Bet = require('../../src/models/bet');
const { TX_STATUS, TX_TYPE } = require('../../src/constants');

const rawInput = {
  txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  txStatus: TX_STATUS.SUCCESS,
  blockNum: 5,
  eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  resultIndex: 1,
  amount: "1000000",
  eventRound: 0,
};

describe('models/bet', () => {
  describe('validate', () => {
    let input;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);
    });

    it('It should throw if txid is missing', () => {
      delete input.txid;
      assert.throws(() => new Bet(input), Error, "txid must be a String"); // must be double quotes
    });

    it('It should throw if txid is null', () => {
      input.txid = null;
      assert.throws(() => new Bet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is undefined', () => {
      input.txid = undefined;
      assert.throws(() => new Bet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is number', () => {
      input.txid = 12;
      assert.throws(() => new Bet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is array', () => {
      input.txid = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Bet(input), Error, "txid must be a String");
    });

    it('It should throw if txid is object', () => {
      input.txid = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Bet(input), Error, "txid must be a String");
    });

    it('It should throw if txStatus is missing', () => {
      delete input.txStatus;
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is null', () => {
      input.txStatus = null;
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is undefined', () => {
      input.txStatus = undefined;
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is number', () => {
      input.txStatus = 12;
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is array', () => {
      input.txStatus = [TX_STATUS.SUCCESS];
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is object', () => {
      input.txStatus = {id:TX_STATUS.SUCCESS};
      assert.throws(() => new Bet(input), Error, "txStatus must be a String");
    });

    it('It should throw if amount is missing', () => {
      delete input.amount;
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is null', () => {
      input.amount = null;
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is undefined', () => {
      input.amount = undefined;
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is number', () => {
      input.amount = 12;
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is array', () => {
      input.amount = ["100000"];
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if amount is object', () => {
      input.amount = {id:"100000"};
      assert.throws(() => new Bet(input), Error, "amount must be a String");
    });

    it('It should throw if eventAddress is missing', () => {
      delete input.eventAddress;
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is null', () => {
      input.eventAddress = null;
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is undefined', () => {
      input.eventAddress = undefined;
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is number', () => {
      input.eventAddress = 12;
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is array', () => {
      input.eventAddress = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is object', () => {
      input.eventAddress = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Bet(input), Error, "eventAddress must be a String");
    });

    it('It should throw if betterAddress is missing', () => {
      delete input.betterAddress;
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if betterAddress is null', () => {
      input.betterAddress = null;
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if betterAddress is undefined', () => {
      input.betterAddress = undefined;
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if betterAddress is number', () => {
      input.betterAddress = 12;
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if betterAddress is array', () => {
      input.betterAddress = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if betterAddress is object', () => {
      input.betterAddress = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Bet(input), Error, "betterAddress must be a String");
    });

    it('It should throw if resultIndex is missing', () => {
      delete input.resultIndex;
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is null', () => {
      input.resultIndex = null;
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is undefined', () => {
      input.resultIndex = undefined;
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is string', () => {
      input.resultIndex = "12";
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is array', () => {
      input.resultIndex = [2];
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if resultIndex is object', () => {
      input.resultIndex = {id:2};
      assert.throws(() => new Bet(input), Error, "resultIndex must be a Number");
    });

    it('It should throw if eventRound is missing', () => {
      delete input.eventRound;
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is null', () => {
      input.eventRound = null;
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is undefined', () => {
      input.eventRound = undefined;
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is string', () => {
      input.eventRound = "12";
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is array', () => {
      input.eventRound = [2];
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });

    it('It should throw if eventRound is object', () => {
      input.eventRound = {id:2};
      assert.throws(() => new Bet(input), Error, "eventRound must be a Number");
    });
  });

  describe('format', () => {
    let input;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);
    });

    it('it should format all the fields', () => {
      const bet = new Bet(input);
      assert.equal(bet.txid, input.txid);
      assert.equal(bet.txStatus, input.txStatus);
      assert.equal(bet.blockNum, input.blockNum);
      assert.equal(bet.eventAddress, input.eventAddress);
      assert.equal(bet.betterAddress, input.betterAddress);
      assert.equal(bet.resultIndex, input.resultIndex);
      assert.equal(bet.amount, input.amount);
      assert.equal(bet.eventRound, input.eventRound);
      assert.equal(bet.txType, TX_TYPE.BET);
    });

    it('It should format the type to be vote', () => {
      input.eventRound = 1;
      const bet = new Bet(input);
      assert.equal(bet.txType, TX_TYPE.VOTE);
    });

    it('It should format the txid to be lowercase', () => {
      input.txid = input.txid.toUpperCase();
      const bet = new Bet(input);
      assert.equal(bet.txid, input.txid.toLowerCase());
    });

    it('It should format the eventAddress to be lowercase', () => {
      input.eventAddress = input.eventAddress.toUpperCase();
      const bet = new Bet(input);
      assert.equal(bet.eventAddress, input.eventAddress.toLowerCase());
    });

    it('It should format the eventAddress to be lowercase', () => {
      input.betterAddress = input.betterAddress.toUpperCase();
      const bet = new Bet(input);
      assert.equal(bet.betterAddress, input.betterAddress.toLowerCase());
    });
  });
});
