const sinon = require('sinon');

const stubCalculateWinnings = sinon.stub().returns(() => '10200000000');

const getContract = () => {
  return {
    methods: {
      calculateWinnings: stubCalculateWinnings,
    }
  }
};

module.exports = {
  getContract,
};