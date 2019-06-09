const { assert } = require('chai');
const { parsePaddedAddress } = require('../../src/utils/web3-utils');

describe('web3-utils.js', () => {
  describe('parsePaddedAddress', () => {
    it('parses the padded address', () => {
      assert.equal(
        parsePaddedAddress('0x000000000000000000000000abcdefghij01234567890abcdefghij01234567890'),
        '0xabcdefghij01234567890abcdefghij01234567890');
    });
  });
});
