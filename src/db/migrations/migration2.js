const { getLogger } = require('../../utils/logger');

async function migration2(db) {
  try {
  } catch (err) {
    getLogger().error(err.message);
    throw err;
  }
}

module.exports = migration2;
