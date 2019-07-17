const { isUndefined } = require('lodash');
const axios = require('axios');
const { CONFIG, isMainnet } = require('../config');
const logger = require('../utils/logger');

const getNakaBaseUrl = () => {
  const address = isMainnet
    ? CONFIG.NAKA_BASE_MAINNET : CONFIG.NAKA_BASE_TESTNET;
  return address;
};

module.exports = {
  getNakaBaseUrl,
  async resolveAddress(address) {
    try {
      if (isUndefined(address)) throw TypeError('address is not defined');
      const { data } = await axios.get(`${getNakaBaseUrl()}/resolve-address`, {
        params: {
          address,
          apikey: CONFIG.API_KEY,
        },
      });
      return data;
    } catch (err) {
      logger.error(`Error AddressNameService.resolveAddresses(): ${err.message}`);
      throw err;
    }
  },
};
