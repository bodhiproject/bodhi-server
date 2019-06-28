const sinon = require('sinon');
const { map } = require('lodash');
const web3 = require('../../../src/web3');

const results = ['Invalid', '1', 'y'];

const stubCalculateWinnings = sinon.stub().returns(() => '10200000000');
const stubVersion = sinon.stub().returns(() => 6);
const stubCurrentRound = sinon.stub().returns(() => 0);
const stubCurrentResultIndex = sinon.stub().returns(() => 0);
const stubCurrentConsensusThreshold = sinon.stub().returns(() => 10);
const stubCurrentArbitrationEndTime = sinon.stub().returns(() => 17600);
const stubEventMetadata = sinon.stub().returns(() => [
  6,
  'Test',
  map(results, (item) => web3.utils.utf8ToHex(item)),
  3,
]);
const stubCentralizedMetadata = sinon.stub().returns(() => [
  '0xae017b8048d79a45867a15345d55912ee4ecaf7c',
  1560965704,
  1560965705,
  1560965705,
  1560965706,
]);
const stubConfigMetadata = sinon.stub().returns(() => [
  10000000,
  17600,
  10,
  10,
]);
const stubTotalBets = sinon.stub().returns(() => '10200000000');
const stubDidWithdraw = sinon.stub().returns(() => true);
const stubDidWithdrawEscrow = sinon.stub().returns(() => true);


const getContract = () => {
  return {
    methods: {
      calculateWinnings: stubCalculateWinnings,
      version: stubVersion,
      currentRound: stubCurrentRound,
      currentResultIndex: stubCurrentResultIndex,
      currentConsensusThreshold: stubCurrentConsensusThreshold,
      currentArbitrationEndTime: stubCurrentArbitrationEndTime,
      eventMetadata: stubEventMetadata,
      centralizedMetadata: stubCentralizedMetadata,
      configMetadata: stubConfigMetadata,
      totalBets: stubTotalBets,
      didWithdraw: stubDidWithdraw,
      didWithdrawEscrow: stubDidWithdrawEscrow,
    }
  }
};

module.exports = {
  getContract,
};