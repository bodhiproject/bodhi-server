const logger = require('../../utils/logger');
const DBHelper = require('../db-helper');
const { TX_STATUS } = require('../../constants');

async function migration1() {
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

    withdrawnLists.forEach((value, key) => {
      DBHelper.updateEventByAddress(
        key,
        { withdrawnList: value },
      );
    });
  } catch (err) {
    logger.error(`Migration 1 error: ${err.message}`);
    throw err;
  }
}

module.exports = migration1;
