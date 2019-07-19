const { assert } = require('chai');

module.exports = {
  equalIgnoreCase: (str1, str2) => assert.equal(str1.toLowerCase(), str2.toLowerCase()),
};
