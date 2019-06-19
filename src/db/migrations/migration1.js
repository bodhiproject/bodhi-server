const logger = require('../../utils/logger');
const DBHelper = require('../db-helper');
const { TX_STATUS } = require('../../constants');

async function migration1() {
  try {
    const events = await DBHelper.findEvent({ txStatus: TX_STATUS.WITHDRAW });
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const withdraws = await DBHelper.findWithdraw({ eventAddress: event.address });
      const withdrawnList = [];
      withdraws.map(withdraw => withdrawnList.push(withdraw.winnerAddress));
      await DBHelper.updateEvent(
        event.txid,
        { withdrawnList },
      );
    }
  } catch (err) {
    logger.error(`Migration 1 error: ${err.message}`);
    throw Error(`Migration 1 error: ${err.message}`);
  }
}

module.exports = migration1;
