const { assert } = require('chai');
const MultipleResultsEvent = require('../../src/models/multiple-results-event');
const { TX_STATUS } = require('../../src/constants');

describe('models/multiple-results-event', () => {
  describe('format', () => {
    let input;

    beforeEach(() => {
      input = {
        txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        txStatus: TX_STATUS.SUCCESS,
        blockNum: 5,
        address: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        version: 6,
        name: "Test",
        results: ['Invalid', 'u', 'y'],
        numOfResults: 2,
        centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428",
        betStartTime: 1560965704,
        betEndTime: 1560965704,
        resultSetStartTime: 1560965704,
        resultSetEndTime: 1560965704,
        escrowAmount: "1000000",
        arbitrationLength: 172800,
        thresholdPercentIncrease: "10",
        arbitrationRewardPercentage: 10,
        consensusThreshold: "100000000000",
        arbitrationEndTime: 1560965704,
      };
    });

    it('It should pass if passing all inputs correctly', () => {
      const event = new MultipleResultsEvent(input);
      assert.equal(event.txid, input.txid);
      assert.equal(event.txStatus, input.txStatus);
      assert.equal(event.blockNum, input.blockNum);
      assert.equal(event.address, input.address);
      assert.equal(event.ownerAddress, input.ownerAddress);
      assert.equal(event.version, input.version);
      assert.equal(event.name, input.name);
      assert.deepEqual(event.results, input.results);
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
  });
});
