const { assert } = require('chai');
const { isUndefined, isFinite, isString, map, filter } = require('lodash');
const web3 = require('../../src/web3');
const Withdraw = require('../../src/models/withdraw');
const { TX_STATUS, TX_TYPE } = require('../../src/constants');

// result-set model not validating on
// 1. centralizedOracleAddress
// 2. nextConsensusThreshold
// 3. nextArbitrationEndTime

describe('models/withdraw', () => {
  describe('validate', () => {
    let input;

    beforeEach(() => {
      input = {
        txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        txStatus: TX_STATUS.SUCCESS,
        blockNum: 5,
        eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        winningAmount: "1000000",
        escrowWithdrawAmount: "1000000",
      };
    });

    it('It should throw if txid is missing', () => {
      delete input.txid;
      assert.throws(() => new Withdraw(input), Error, "txid must be a String"); // must be double quotes
    });

    it('It should throw if txid is null', () => {
      input.txid = null;
      assert.throws(() => new Withdraw(input), Error, "txid must be a String");
    });

    it('It should throw if txid is undefined', () => {
      input.txid = undefined;
      assert.throws(() => new Withdraw(input), Error, "txid must be a String");
    });

    it('It should throw if txid is number', () => {
      input.txid = 12;
      assert.throws(() => new Withdraw(input), Error, "txid must be a String");
    });

    it('It should throw if txid is array', () => {
      input.txid = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Withdraw(input), Error, "txid must be a String");
    });

    it('It should throw if txid is object', () => {
      input.txid = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Withdraw(input), Error, "txid must be a String");
    });

    it('It should throw if txStatus is missing', () => {
      delete input.txStatus;
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is null', () => {
      input.txStatus = null;
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is undefined', () => {
      input.txStatus = undefined;
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is number', () => {
      input.txStatus = 12;
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is array', () => {
      input.txStatus = [TX_STATUS.SUCCESS];
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if txStatus is object', () => {
      input.txStatus = {id:TX_STATUS.SUCCESS};
      assert.throws(() => new Withdraw(input), Error, "txStatus must be a String");
    });

    it('It should throw if eventAddress is missing', () => {
      delete input.eventAddress;
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is null', () => {
      input.eventAddress = null;
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is undefined', () => {
      input.eventAddress = undefined;
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is number', () => {
      input.eventAddress = 12;
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is array', () => {
      input.eventAddress = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if eventAddress is object', () => {
      input.eventAddress = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Withdraw(input), Error, "eventAddress must be a String");
    });

    it('It should throw if winnerAddress is missing', () => {
      delete input.winnerAddress;
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winnerAddress is null', () => {
      input.winnerAddress = null;
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winnerAddress is undefined', () => {
      input.winnerAddress = undefined;
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winnerAddress is number', () => {
      input.winnerAddress = 12;
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winnerAddress is array', () => {
      input.winnerAddress = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winnerAddress is object', () => {
      input.winnerAddress = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new Withdraw(input), Error, "winnerAddress must be a String");
    });

    it('It should throw if winningAmount is missing', () => {
      delete input.winningAmount;
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if winningAmount is null', () => {
      input.winningAmount = null;
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if winningAmount is undefined', () => {
      input.winningAmount = undefined;
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if winningAmount is number', () => {
      input.winningAmount = 12;
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if winningAmount is array', () => {
      input.winningAmount = ["100000"];
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if winningAmount is object', () => {
      input.winningAmount = {id:"100000"};
      assert.throws(() => new Withdraw(input), Error, "winningAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is missing', () => {
      delete input.escrowWithdrawAmount;
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is null', () => {
      input.escrowWithdrawAmount = null;
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is undefined', () => {
      input.escrowWithdrawAmount = undefined;
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is number', () => {
      input.escrowWithdrawAmount = 12;
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is array', () => {
      input.escrowWithdrawAmount = ["100000"];
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
    });

    it('It should throw if escrowWithdrawAmount is object', () => {
      input.escrowWithdrawAmount = {id:"100000"};
      assert.throws(() => new Withdraw(input), Error, "escrowWithdrawAmount must be a String");
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
        winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        winningAmount: "1000000",
        escrowWithdrawAmount: "1000000",
      };
    });

    it('It should pass if passing all inputs correctly', () => {
      const bet = new Withdraw(input);
      assert.equal(bet.txid, input.txid);
      assert.equal(bet.txStatus, input.txStatus);
      assert.equal(bet.blockNum, input.blockNum);
      assert.equal(bet.eventAddress, input.eventAddress);
      assert.equal(bet.winnerAddress, input.winnerAddress);
      assert.equal(bet.winningAmount, input.winningAmount);
      assert.equal(bet.escrowWithdrawAmount, input.escrowWithdrawAmount);
      assert.equal(bet.txType, TX_TYPE.WITHDRAW);
    });
  });
});
