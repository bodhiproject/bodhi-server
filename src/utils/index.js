const { find, isUndefined, isNull, isString, forEach, isArray } = require('lodash');
const { resolveAddress } = require('../api/address-name-service');

module.exports = {
  isDefined: item => !isUndefined(item) && !isNull(item),

  /**
   * Gets the object from the ABI given the name and type
   * @param {object} abi ABI to search in
   * @param {string} name Name of the function or event
   * @param {string} type One of: [function, event]
   * @return {object|undefined} Object found in ABI
   */
  getAbiObject: (abi, name, type) => {
    if (!abi) return undefined;
    return find(abi, { name, type });
  },

  /**
   * Returns the lowercased string if the string is valid.
   * @param {string} str String to lowercase
   * @return {string} Lowercased string
   */
  toLowerCase: (str) => {
    if (isUndefined(str)) return undefined;
    if (isNull(str)) return null;
    if (!isString(str)) return str;
    return str.toLowerCase();
  },

  /**
   * Insert names to Names DB when the address has a name.
   * @param {string} address Address to check name
   * @param {func} DBHelper DBHelper methods
   */
  getAndInsertNames: async (address, DBHelper) => {
    if (isUndefined(address)) return;
    let addresses = address;
    if (!isArray(address)) addresses = [address];
    const toCheckAddresses = [];
    let promises = [];
    forEach(addresses, async (item, key) => {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          const ret = await DBHelper.findOneName({ address: item });
          if (!ret) {
            toCheckAddresses.push(item);
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      }));
    });
    await Promise.all(promises);

    const addressNameObj = await resolveAddress(toCheckAddresses);
    Object.keys(addressNameObj).forEach(key => (addressNameObj[key] === '') && delete addressNameObj[key]);

    promises = [];
    forEach(addressNameObj, async (name, key) => {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          await DBHelper.insertName({ address: key, name });
          resolve();
        } catch (err) {
          reject(err);
        }
      }));
    });
    await Promise.all(promises);
  },
};
