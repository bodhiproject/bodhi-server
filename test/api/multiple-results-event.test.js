const { isString } = require('lodash');
const Chai = require('chai');
const sinon = require('sinon');
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
  let stubGetContract;

  beforeEach(() => {
      stubGetContract = sinon.stub(Event, 'getContract').callsFake((eventAddress) => {
        if (eventAddress !== '0x8b2b1838efff78e5ed9e00d95d9ef071f2c27be6') return undefined;
        return {
          methods: {
            calculateWinnings: (address) => {
              return () => {
                if (address === '0x939592864C0Bd3355B2D54e4fA2203E8343B6d6a') return "10200000000";
              };
            }
          }
        }
      });
  });

  afterEach(() => {
    stubGetContract.restore();
  });

  describe('calculateWinnings()', () => {
    it('Returns the calculateWinnings', async () => {
      const res = await Event.calculateWinnings({ eventAddress, address });
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

  describe('version()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.version({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentRound()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.currentRound({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentResultIndex()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.currentResultIndex({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentConsensusThreshold()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.currentConsensusThreshold({})).to.be.rejectedWith(Error);
    });
  });

  describe('currentArbitrationEndTime()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.currentArbitrationEndTime({})).to.be.rejectedWith(Error);
    });
  });

  describe('eventMetadata()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.eventMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('centralizedMetadata()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.centralizedMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('configMetadata()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.configMetadata({})).to.be.rejectedWith(Error);
    });
  });

  describe('totalBets()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.totalBets({})).to.be.rejectedWith(Error);
    });
  });

  describe('didWithdraw()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.didWithdraw({
        address,
      })).to.be.rejectedWith(Error);
    });

    it('It throws if address is undefined', () => {
      expect(Event.didWithdraw({
        eventAddress,
      })).to.be.rejectedWith(Error);
    });
  });

  describe('didWithdrawEscrow()', () => {
    it('It throws if eventAddress is undefined', () => {
      expect(Event.didWithdrawEscrow({})).to.be.rejectedWith(Error);
    });
  });
});