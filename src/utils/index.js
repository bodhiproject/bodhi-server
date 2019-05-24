const { find, isUndefined, isNull, isString } = require('lodash');

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
};
