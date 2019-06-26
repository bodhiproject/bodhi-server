const { isString } = require('lodash');
const Chai = require('chai');
const ChaiAsPromised = require('chai-as-promised');

const Event = require('../../src/api/multiple-results-event');
const Mocks = require('./mock/multiple-results-event');

Chai.use(ChaiAsPromised);
const assert = Chai.assert;
const expect = Chai.expect;

const eventAddress = '0x8b2b1838efff78e5ed9e00d95d9ef071f2c27be6';
const address = '0x939592864C0Bd3355B2D54e4fA2203E8343B6d6a';

describe('api/multiple-results-event', () => {
  const contractAddress = 'a5b27c03e76d4cf10928120439fa96181f07520c';

  describe('calculateWinnings()', () => {
    it('Returns the calculateWinnings', () => {
      const res = Mocks.calculateWinnings.result;
      assert.isDefined(res);
      assert.isTrue(isString(res));
      assert.isFalse(isNaN(res));
    });

    it('It throws if eventAddress is undefined', () => {
      expect(Event.calculateWinnings({
        address,
      })).to.be.rejectedWith(Error);
    });

    it('It throws if address is undefined', () => {
      expect(Event.calculateWinnings({
        eventAddress,
      })).to.be.rejectedWith(Error);
    });
  });
});