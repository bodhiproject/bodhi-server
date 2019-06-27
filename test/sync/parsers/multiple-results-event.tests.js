const { assert } = require('chai');
const sinon = require('sinon');
const { TX_STATUS } = require('../../../src/constants');
const Config = require('../../../src/config');

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
    stubDetermineContractVersion = sinon.stub(Config, 'determineContractVersion').returns(5);
    parseEvent = require('../../../src/sync/parsers/multiple-results-event'); // eslint-disable-line
  });

  afterEach(() => {
    stubDetermineContractVersion.restore();
    sinon.restore();

    // TODO: enable when websockets are used for web3
    // Close the websocket connection for web3 so tests don't hang
    // require('../../../src/web3').currentProvider.connection.close(); // eslint-disable-line
  });

  it('parses the log and fetches other data', async () => {
    const event = await parseEvent({ log });
    assert.equal(event.txid, '0x6347b37d00e43f7591fc3621085e5759b535135aeafc5589c2115b4712239c1d');
    assert.equal(event.txStatus, TX_STATUS.SUCCESS);
    assert.equal(event.blockNum, 3840954);
    assert.equal(event.address, '0x72dd97e774f27b61bf58669be4dbabf9c3d349a4');
    assert.equal(event.ownerAddress, '0x7937a1e86f2cb43d6c91d27ca7a4f93c7f7189c3');
    assert.equal(event.version, 5);
    assert.equal(event.name, 'The');
    assert.deepEqual(event.results, ['Invalid', 'u', 'y']);
    assert.equal(event.numOfResults, 3);
    assert.equal(
      event.centralizedOracle.toLowerCase(),
      '0x7937A1E86F2Cb43D6c91D27ca7A4f93c7F7189C3'.toLowerCase(),
    );
    assert.equal(event.betStartTime, 1559877543);
    assert.equal(event.betEndTime, 1559963943);
    assert.equal(event.resultSetStartTime, 1559963943);
    assert.equal(event.resultSetEndTime, 1560050343);
    assert.equal(event.escrowAmount, '100000000');
    assert.equal(event.arbitrationLength, 300);
    assert.equal(event.thresholdPercentIncrease, 10);
    assert.equal(event.arbitrationRewardPercentage, 10);
    assert.isString(event.consensusThreshold);
    assert.isNumber(event.arbitrationEndTime);
  });
});
