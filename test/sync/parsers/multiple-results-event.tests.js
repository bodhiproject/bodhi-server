const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const Web3 = require('web3');
const { each, map } = require('lodash');
const { TX_STATUS } = require('../../../src/constants');
const Config = require('../../../src/config');

const { utils: { utf8ToHex, toBN } } = new Web3();

const log = {
  address: '0xae017b8048d79a45867a15345d55912ee4ecaf7c',
  topics: [
    '0xa74ac8982b8c0518a2837e092b2978b106b361a24d5c6dff297146e10925ae30',
    '0x00000000000000000000000072dd97e774f27b61bf58669be4dbabf9c3d349a4',
    '0x0000000000000000000000007937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3',
  ],
  data: '0x',
  blockNumber: 3840954,
  blockHash: '0x323659772837b0b5404d4d55b1d2b818ec71cfe20e00f25a4c4c3ee6b090f6ba',
  transactionHash: '0x6347b37d00e43f7591fc3621085e5759b535135aeafc5589c2115b4712239c1d',
  transactionIndex: 0,
  logIndex: 3,
};

describe('sync/parsers/multiple-results-event', () => {
  let stubDetermineContractVersion;
  let parseEvent;

  beforeEach(() => {
    stubDetermineContractVersion = sinon.stub(Config, 'determineContractVersion')
      .returns(5);
    parseEvent = proxyquire('../../../src/sync/parsers/multiple-results-event', {
      '../../utils/web3-utils': {
        getContract: () => ({
          methods: ({
            eventMetadata: () => ({
              call: async () => [
                5,
                'Test Event',
                map(['Invalid', 'A', 'B'], item => utf8ToHex(item)),
                3,
              ],
            }),
            centralizedMetadata: () => ({
              call: async () => [
                '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428',
                toBN(1),
                toBN(2),
                toBN(3),
                toBN(4),
              ],
            }),
            configMetadata: () => ({
              call: async () => [
                toBN('100000000'),
                toBN(300),
                toBN(10),
                toBN(10),
              ],
            }),
            currentConsensusThreshold: () => ({
              call: async () => toBN('10000000000'),
            }),
            currentArbitrationEndTime: () => ({
              call: async () => toBN(0),
            }),
          }),
        }),
      },
    });
  });

  afterEach(() => {
    stubDetermineContractVersion.restore();
    sinon.restore();
    proxyquire.callThru();
  });

  it.only('parses the log and fetches other data', async () => {
    const event = await parseEvent({ log });
    assert.isString(event.txid);
    assert.equal(event.txid, '0x6347b37d00e43f7591fc3621085e5759b535135aeafc5589c2115b4712239c1d');

    assert.isString(event.txStatus);
    assert.equal(event.txStatus, TX_STATUS.SUCCESS);

    assert.isNumber(event.blockNum);
    assert.equal(event.blockNum, 3840954);

    assert.isString(event.address);
    assert.equal(
      event.address.toLowerCase(),
      '0x72dd97e774f27b61bf58669be4dbabf9c3d349a4'.toLowerCase(),
    );

    assert.isString(event.ownerAddress);
    assert.equal(
      event.ownerAddress.toLowerCase(),
      '0x7937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3'.toLowerCase(),
    );

    assert.isNumber(event.version);
    assert.equal(event.version, 5);

    assert.isString(event.name);
    assert.equal(event.name, 'Test Event');

    each(event.results, result => assert.isString(result));
    assert.deepEqual(event.results, ['Invalid', 'A', 'B']);

    assert.isNumber(event.numOfResults);
    assert.equal(event.numOfResults, 3);

    assert.isString(event.centralizedOracle);
    assert.equal(
      event.centralizedOracle.toLowerCase(),
      '0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428'.toLowerCase(),
    );

    assert.isNumber(event.betStartTime);
    assert.equal(event.betStartTime, 1);

    assert.isNumber(event.betEndTime);
    assert.equal(event.betEndTime, 2);

    assert.isNumber(event.resultSetStartTime);
    assert.equal(event.resultSetStartTime, 3);

    assert.isNumber(event.resultSetEndTime);
    assert.equal(event.resultSetEndTime, 4);

    assert.isString(event.escrowAmount);
    assert.equal(event.escrowAmount, '100000000');

    assert.isNumber(event.arbitrationLength);
    assert.equal(event.arbitrationLength, 300);

    assert.isString(event.thresholdPercentIncrease);
    assert.equal(event.thresholdPercentIncrease, '10');

    assert.isNumber(event.arbitrationRewardPercentage);
    assert.equal(event.arbitrationRewardPercentage, 10);

    assert.isString(event.consensusThreshold);
    assert.equal(event.consensusThreshold, '10000000000');

    assert.isNumber(event.arbitrationEndTime);
    assert.equal(event.arbitrationEndTime, 0);
  });
});
