const logger = require('../../utils/logger');
const DBHelper = require('../db-helper');
const { TX_STATUS } = require('../../constants');

async function migration1(next) {
  try {
    const withdraws = await DBHelper.findWithdraw({ txStatus: TX_STATUS.SUCCESS });
    const withdrawnLists = new Map();
    for (let i = 0; i < withdraws.length; i++) {
      const withdraw = withdraws[i];
      let withdrawnList = [];
      if (withdrawnLists.has(withdraw.eventAddress)) {
        withdrawnList = withdrawnLists.get(withdraw.eventAddress);
      }
      withdrawnList.push(withdraw.winnerAddress);
      withdrawnLists.set(withdraw.eventAddress, withdrawnList);
    }

    const promises = [];
    withdrawnLists.forEach(async (value, key) => {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          await DBHelper.updateEventByAddress(
            key,
            { withdrawnList: value },
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      }));
    });

    await Promise.all(promises);
    logger.info('Migration 1 done');
    next();
  } catch (err) {
    logger.error(`Migration 1 error: ${err.message}`);
    throw err;
  }
}

module.exports = migration1;
