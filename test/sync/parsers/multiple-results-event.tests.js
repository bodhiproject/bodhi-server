const { assert } = require('chai');
const sinon = require('sinon');
const parseEvent = require('../../../src/sync/parsers/multiple-results-event');
const { TX_STATUS } = require('../../../src/constants');

const log = {
  address: '0x45c537f157986dfaa7026af3f055bba77b970fc8',
  topics: [
    '0xa74ac8982b8c0518a2837e092b2978b106b361a24d5c6dff297146e10925ae30',
    '0x000000000000000000000000ac35a87545f0eae73eb8aa393f4cb64947064145',
    '0x000000000000000000000000939592864c0bd3355b2d54e4fa2203e8343b6d6a',
  ],
  data: '0x',
  blockNumber: 3772854,
  blockHash: '0xf5416c57a10c452f608e0b766a4f3a11e11cddcff39e7a00229eea70668bfa0c',
  transactionHash: '0xc344fa7a52bc588e127ba9ad8a2e0670ad1c029f1e8ae652c7cb09bd2161e0df',
  transactionIndex: 0,
  logIndex: 3,
};

describe('sync/parsers/multiple-results-event', () => {
  let spyDetermineContractVersion;
  let spy

  beforeEach(() => {
    spyDetermineContractVersion = sinon.stub(parseEvent, 'determineContractVersion')
      .callsFake(() => 5);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('parses the log and fetches other data', () => {
    const event = parseEvent({ log });
    assert.equal(event.txid, '0x5ad29ce04995209d87e07b262e2346e1a4e855bd893973c3ff02d371ddc9b416');
    assert.equal(event.txStatus, TX_STATUS.SUCCESS);
    assert.equal(event.blockNum, 3803127);
    assert.equal(event.eventAddress, '0xdd2e163c2a7fe272a396b4a90ee7b1bd2a83ed83');
    assert.equal(event.winnerAddress, '0xbc4b8726f9619c871fad66030116964480205b9d');
    assert.equal(event.winningAmount, '1100000000');
    assert.equal(event.escrowWithdrawAmount, '0');
  });
});
