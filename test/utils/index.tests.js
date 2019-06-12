const { assert } = require('chai');
const { isDefined, toLowerCase } = require('../../src/utils');

describe('utils/index', () => {
  describe('isDefined', () => {
    it('returns true if defined', () => {
      assert.isTrue(isDefined(''));
      assert.isTrue(isDefined(0));
      assert.isTrue(isDefined([]));
    });

    it('returns false if undefined or null', () => {
      assert.isFalse(isDefined(undefined));
      assert.isFalse(isDefined(null));
    });
  });

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
