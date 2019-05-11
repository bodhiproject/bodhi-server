const _ = require('lodash');

const { getLogger } = require('../utils/logger');
const { EVENT_STATUS } = require('../constants');

module.exports = class DBHelper {
  /* Events */
  static async findOneEvent(db, query) {
    try {
      return await db.Events.findOne(query);
    } catch (err) {
      getLogger().error(`FIND Event error: ${err.message}`);
      throw err;
    }
  }

  static async insertEvent(db, event) {
    try {
      await db.Events.insert(event);
    } catch (err) {
      getLogger().error(`INSERT Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEvent(db, event) {
    try {
      await db.Events.update(
        { address: event.address },
        { $set: event },
        {},
      );
    } catch (err) {
      getLogger().error(`UPDATE Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusBetting(db, currBlockTime) {
    try {
      await db.Events.update(
        {
          status: EVENT_STATUS.CREATED,
          betStartTime: { $lte: currBlockTime },
          betEndTime: { $gt: currBlockTime },
        },
        { $set: { status: EVENT_STATUS.BETTING } },
        { multi: true },
      );
    } catch (err) {
      getLogger().error(`UPDATE Event Status Betting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusOracleResultSetting(db, currBlockTime) {
    try {
      await db.Events.update(
        {
          status: EVENT_STATUS.BETTING,
          betEndTime: { $lte: currBlockTime },
          resultSetEndTime: { $gt: currBlockTime },
        },
        { $set: { status: EVENT_STATUS.ORACLE_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      getLogger().error(`UPDATE Event Status Oracle Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusOpenResultSetting(db, currBlockTime) {
    try {
      await db.Events.update(
        {
          status: EVENT_STATUS.ORACLE_RESULT_SETTING,
          resultSetEndTime: { $lte: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.OPEN_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      getLogger().error(`UPDATE Event Status Open Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusArbitration(db) {
    try {
      await db.Events.update(
        {
          status: {
            $or: [
              EVENT_STATUS.ORACLE_RESULT_SETTING,
              EVENT_STATUS.OPEN_RESULT_SETTING,
            ],
          },
          currentRound: { $gt: 0 },
        },
        { $set: { status: EVENT_STATUS.ARBITRATION } },
        { multi: true },
      );
    } catch (err) {
      getLogger().error(`UPDATE Event Status Arbitration error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusWithdrawing(db, currBlockTime) {
    try {
      await db.Events.update(
        {
          status: EVENT_STATUS.ARBITRATION,
          arbitrationEndTime: { $lte: currBlockTime },
        },
        { $set: { status: EVENT_STATUS.WITHDRAWING } },
        { multi: true },
      );
    } catch (err) {
      getLogger().error(`UPDATE Event Status Withdrawing error: ${err.message}`);
      throw err;
    }
  }

  /* Bets */
  static async findOneBet(db, query) {
    try {
      return await db.Bets.findOne(query);
    } catch (err) {
      getLogger().error(`FIND Bet error: ${err.message}`);
      throw err;
    }
  }

  static async countBet(db, query) {
    try {
      return await db.Bets.count(query);
    } catch (err) {
      getLogger().error(`COUNT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async insertBet(db, bet) {
    try {
      await db.Bets.insert(bet);
    } catch (err) {
      getLogger().error(`INSERT Bet error: ${err.message}`);
      throw err;
    }
  }

  /* ResultSets */
  static async findOneResultSet(db, query) {
    try {
      return await db.ResultSets.findOne(query);
    } catch (err) {
      getLogger().error(`FIND ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async countResultSet(db, query) {
    try {
      return await db.ResultSets.count(query);
    } catch (err) {
      getLogger().error(`COUNT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async insertResultSet(db, resultSet) {
    try {
      await db.ResultSets.insert(resultSet);
    } catch (err) {
      getLogger().error(`INSERT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  /* Withdraws */
  static async findOneWithdraw(db, query) {
    try {
      return await db.Withdraws.findOne(query);
    } catch (err) {
      getLogger().error(`FIND Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async countWithdraw(db, query) {
    try {
      return await db.Withdraws.count(query);
    } catch (err) {
      getLogger().error(`COUNT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async insertWithdraw(db, withdraw) {
    try {
      await db.Withdraws.insert(withdraw);
    } catch (err) {
      getLogger().error(`INSERT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  /* Blocks */
  static async insertBlock(db, blockNum, blockTime) {
    try {
      await db.Blocks.insert({
        _id: blockNum,
        blockNum,
        blockTime,
      });
    } catch (err) {
      getLogger().error(`INSERT Block error: ${err.message}`);
      throw err;
    }
  }

  /* TransactionReceipts */
  static async findOneTransactionReceipt(db, query) {
    try {
      return await db.TransactionReceipts.findOne(query);
    } catch (err) {
      getLogger().error(`FIND TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async insertTransactionReceipt(db, txReceipt) {
    try {
      await db.TransactionReceipts.insert(txReceipt);
    } catch (err) {
      getLogger().error(`INSERT TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }
};
