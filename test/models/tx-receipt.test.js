const { assert } = require('chai');
const { isUndefined, isFinite, isString, map, filter } = require('lodash');
const web3 = require('../../src/web3');
const TxReceipt = require('../../src/models/tx-receipt');
const { TX_STATUS, TX_TYPE } = require('../../src/constants');

const rawInput = {
  status: true,
  blockHash: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  transactionHash: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  blockNumber: 5,
  from: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  to: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  contractAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
  cumulativeGasUsed: 100000,
  gasUsed: 1000,
  gasPrice: "300000"
};

describe('models/tx-receipt', () => {
  describe('validate', () => {
    let input;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);
    });

    it('It should not throw if blockHash is null', () => {
      input.blockHash = null;
      assert.doesNotThrow(() => new TxReceipt(input), Error, "blockHash must be a string|null");
    });

    it('It should throw if blockHash is undefined', () => {
      input.blockHash = undefined;
      assert.throws(() => new TxReceipt(input), Error, "blockHash must be a string|null");
    });

    it('It should throw if blockHash is number', () => {
      input.blockHash = 1;
      assert.throws(() => new TxReceipt(input), Error, "blockHash must be a string|null");
    });

    it('It should throw if blockHash is array', () => {
      input.blockHash = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new TxReceipt(input), Error, "blockHash must be a string|null");
    });

    it('It should throw if blockHash is object', () => {
      input.blockHash = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new TxReceipt(input), Error, "blockHash must be a string|null");
    });

    it('It should not throw if blockNumber is null', () => {
      input.blockNumber = null;
      assert.doesNotThrow(() => new TxReceipt(input), Error, "blockNumber must be a number|null");
    });

    it('It should throw if blockNumber is undefined', () => {
      input.blockNumber = undefined;
      assert.throws(() => new TxReceipt(input), Error, "blockNumber must be a number|null");
    });

    it('It should throw if blockNumber is string', () => {
      input.blockNumber = '1';
      assert.throws(() => new TxReceipt(input), Error, "blockNumber must be a number|null");
    });

    it('It should throw if blockNumber is array', () => {
      input.blockNumber = [1];
      assert.throws(() => new TxReceipt(input), Error, "blockNumber must be a number|null");
    });

    it('It should throw if blockNumber is object', () => {
      input.blockNumber = {id:1};
      assert.throws(() => new TxReceipt(input), Error, "blockNumber must be a number|null");
    });

    it('It should throw if transactionHash is null', () => {
      input.transactionHash = null;
      assert.throws(() => new TxReceipt(input), Error, "transactionHash must be a string");
    });

    it('It should throw if transactionHash is undefined', () => {
      input.transactionHash = undefined;
      assert.throws(() => new TxReceipt(input), Error, "transactionHash must be a string");
    });

    it('It should throw if transactionHash is number', () => {
      input.transactionHash = 1;
      assert.throws(() => new TxReceipt(input), Error, "transactionHash must be a string");
    });

    it('It should throw if transactionHash is array', () => {
      input.transactionHash = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new TxReceipt(input), Error, "transactionHash must be a string");
    });

    it('It should throw if transactionHash is object', () => {
      input.transactionHash = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new TxReceipt(input), Error, "transactionHash must be a string");
    });

    it('It should throw if eventAddress is null', () => {
      input.from = null;
      assert.throws(() => new TxReceipt(input), Error, "from must be a string");
    });

    it('It should throw if eventAddress is undefined', () => {
      input.from = undefined;
      assert.throws(() => new TxReceipt(input), Error, "from must be a string");
    });

    it('It should throw if eventAddress is number', () => {
      input.from = 1;
      assert.throws(() => new TxReceipt(input), Error, "from must be a string");
    });

    it('It should throw if eventAddress is array', () => {
      input.from = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new TxReceipt(input), Error, "from must be a string");
    });

    it('It should throw if eventAddress is object', () => {
      input.from = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new TxReceipt(input), Error, "from must be a string");
    });

    it('It should not throw if to is null', () => {
      input.to = null;
      assert.doesNotThrow(() => new TxReceipt(input), Error, "to must be a string|null");
    });

    it('It should throw if to is undefined', () => {
      input.to = undefined;
      assert.throws(() => new TxReceipt(input), Error, "to must be a string|null");
    });

    it('It should throw if to is number', () => {
      input.to = 1;
      assert.throws(() => new TxReceipt(input), Error, "to must be a string|null");
    });

    it('It should throw if to is array', () => {
      input.to = ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"];
      assert.throws(() => new TxReceipt(input), Error, "to must be a string|null");
    });

    it('It should throw if to is object', () => {
      input.to = {id:"0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"};
      assert.throws(() => new TxReceipt(input), Error, "to must be a string|null");
    });

    it('It should throw if cumulativeGasUsed is null', () => {
      input.cumulativeGasUsed = null;
      assert.throws(() => new TxReceipt(input), Error, "cumulativeGasUsed must be a number");
    });

    it('It should throw if cumulativeGasUsed is undefined', () => {
      input.cumulativeGasUsed = undefined;
      assert.throws(() => new TxReceipt(input), Error, "cumulativeGasUsed must be a number");
    });

    it('It should throw if cumulativeGasUsed is string', () => {
      input.cumulativeGasUsed = "1";
      assert.throws(() => new TxReceipt(input), Error, "cumulativeGasUsed must be a number");
    });

    it('It should throw if cumulativeGasUsed is array', () => {
      input.cumulativeGasUsed = [1];
      assert.throws(() => new TxReceipt(input), Error, "cumulativeGasUsed must be a number");
    });

    it('It should throw if cumulativeGasUsed is object', () => {
      input.cumulativeGasUsed = {id:1};
      assert.throws(() => new TxReceipt(input), Error, "cumulativeGasUsed must be a number");
    });

    it('It should throw if gasUsed is null', () => {
      input.gasUsed = null;
      assert.throws(() => new TxReceipt(input), Error, "gasUsed must be a number");
    });

    it('It should throw if gasUsed is undefined', () => {
      input.gasUsed = undefined;
      assert.throws(() => new TxReceipt(input), Error, "gasUsed must be a number");
    });

    it('It should throw if gasUsed is string', () => {
      input.gasUsed = '1';
      assert.throws(() => new TxReceipt(input), Error, "gasUsed must be a number");
    });

    it('It should throw if gasUsed is array', () => {
      input.gasUsed = [1];
      assert.throws(() => new TxReceipt(input), Error, "gasUsed must be a number");
    });

    it('It should throw if gasUsed is object', () => {
      input.gasUsed = {id:1};
      assert.throws(() => new TxReceipt(input), Error, "gasUsed must be a number");
    });
  });

  describe('format', () => {
    let input;

    beforeEach(() => {
      input = {};
      Object.assign(input, rawInput);
    });

    it('it should format all the fields', () => {
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.status, input.status);
      assert.equal(txReceipt.blockHash, input.blockHash);
      assert.equal(txReceipt.blockNum, input.blockNumber);
      assert.equal(txReceipt.transactionHash, input.transactionHash);
      assert.equal(txReceipt.from, input.from);
      assert.equal(txReceipt.to, input.to);
      assert.equal(txReceipt.contractAddress, input.contractAddress);
      assert.equal(txReceipt.cumulativeGasUsed, input.cumulativeGasUsed);
      assert.equal(txReceipt.gasUsed, input.gasUsed);
      assert.equal(txReceipt.gasPrice, input.gasPrice);
    });

    it('It should format the blockHash to be lowercase', () => {
      input.blockHash = input.blockHash.toUpperCase();
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.blockHash, input.blockHash.toLowerCase());
    });

    it('It should format the transactionHash to be lowercase', () => {
      input.transactionHash = input.transactionHash.toUpperCase();
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.transactionHash, input.transactionHash.toLowerCase());
    });

    it('It should format the from to be lowercase', () => {
      input.from = input.from.toUpperCase();
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.from, input.from.toLowerCase());
    });

    it('It should format the to to be lowercase', () => {
      input.to = input.to.toUpperCase();
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.to, input.to.toLowerCase());
    });

    it('It should format the contractAddress to be lowercase', () => {
      input.contractAddress = input.contractAddress.toUpperCase();
      const txReceipt = new TxReceipt(input);
      assert.equal(txReceipt.contractAddress, input.contractAddress.toLowerCase());
    });
  });
});
