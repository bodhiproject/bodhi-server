const { isUndefined, map, isArray } = require('lodash');
const async = require('async');
const { CONFIG, addressNameServiceMeta } = require('../config');
const { BLOCKCHAIN_ENV } = require('../constants');
const web3 = require('../web3');
const logger = require('../utils/logger');

const getContract = () => {
  const metadata = addressNameServiceMeta(0);
  const address = CONFIG.NETWORK === BLOCKCHAIN_ENV.MAINNET
    ? metadata.mainnet : metadata.testnet;
  return new web3.eth.Contract(metadata.abi, address);
};

async function wrapper(me, next) {
  await me();
  next();
}

module.exports = {
  getContract,
  async resolveAddress(args) {
    try {
      let { addresses } = args;
      if (isUndefined(addresses)) throw TypeError('addresses is not defined');
      if(!isArray(addresses)) addresses = [addresses]
      const ret = {};
      try {
        let i = 0;
        await async.whilst(
          check => check(null, i < addresses.length), // trigger iter
          (next) => {
            const address = addresses[i];
            i++;
            try {
              wrapper(async() => {
                ret[address] = await this.getContract().methods.resolveAddress(address).call();
              },
              () =>  next(null, i))

            } catch (err) {
              next(err, i); // err met, trigger the callback to end this loop
            }
          },
        );
      } catch (err) {
        // will only be called if should end this loop
        logger.error(err);
        throw err;
      }

      return ret;
    } catch (err) {
      logger.error(`Error AddressNameService.resolveAddresses(): ${err.message}`);
      throw err;
    }
  },
};
