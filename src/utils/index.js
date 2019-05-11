const { find } = require('lodash');

module.exports = {
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
};
