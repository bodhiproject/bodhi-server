const { assert } = require('chai');
const { toLowerCase } = require('.');

describe('utils/index.js', () => {
  describe('toLowerCase', () => {
    it('lowercases the string', () => {
      assert.equal(toLowerCase('ABC'), 'abc');
    });

    it('returns undefined if the string is undefined', () => {
      assert.isUndefined(toLowerCase(undefined));
    });

    it('returns null if the string is null', () => {
      assert.isNull(toLowerCase(null));
    });

    it('returns the str if the string is not a string', () => {
      assert.equal(toLowerCase(1), 1);
    });
  });
});
