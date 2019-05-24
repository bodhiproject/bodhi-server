const { isNull } = require('lodash');
const { logger } = require('../utils/logger');
const { EVENT_STATUS } = require('../constants');
const { db } = require('.');

module.exports = class DBHelper {
  /* Blocks */
  static async findOneBlock(query) {
    try {
      return await db.Blocks.findOne(query);
    } catch (err) {
      logger().error(`FIND Block error: ${err.message}`);
      throw err;
    }
  }

  static async findLatestBlock() {
    return db.Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  }

  static async insertBlock(blockNum, blockTime) {
    try {
      await db.Blocks.insert({
        _id: blockNum,
        blockNum,
        blockTime,
      });
    } catch (err) {
      logger().error(`INSERT Block error: ${err.message}`);
      throw err;
    }
  }

  /* TransactionReceipts */
  static async findOneTransactionReceipt(query) {
    try {
      return await db.TransactionReceipts.findOne(query);
    } catch (err) {
      logger().error(`FIND TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async insertTransactionReceipt(txReceipt) {
    try {
      const existing = await DBHelper.findOneTransactionReceipt({ transactionHash: txReceipt.transactionHash });
      if (isNull(existing)) {
        await db.TransactionReceipts.insert(txReceipt);
      } else {
        // Set fields from existing
        txReceipt.gasPrice = existing.gasPrice;
        await DBHelper.updateTransactionReceipt(txReceipt);
      }
    } catch (err) {
      logger().error(`INSERT TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async updateTransactionReceipt(txReceipt) {
    try {
      await db.TransactionReceipts.update(
        { transactionHash: txReceipt.transactionHash },
        { $set: txReceipt },
        {},
      );
    } catch (err) {
      logger().error(`UPDATE TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  /* Events */
  static async findEvent(query) {
    try {
      return await db.Events.find(query);
    } catch (err) {
      logger().error(`FIND Event error: ${err.message}`);
      throw err;
    }
  }

  static async findOneEvent(query) {
    try {
      return await db.Events.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Event error: ${err.message}`);
      throw err;
    }
  }

  static async insertEvent(event) {
    try {
      const existing = await DBHelper.findOneEvent({ txid: event.txid });
      if (isNull(existing)) {
        await db.Events.insert(event);
      } else {
        // Set non-blockchain vars from existing event
        event.language = existing.language;
        await DBHelper.updateEvent(event);
      }
    } catch (err) {
      logger().error(`INSERT Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEvent(event) {
    try {
      await db.Events.update(
        { txid: event.txid },
        { $set: event },
        {},
      );
    } catch (err) {
      logger().error(`UPDATE Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusBetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          $not: { status: EVENT_STATUS.BETTING },
          betStartTime: { $lte: currBlockTime },
          betEndTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.BETTING } },
        { multi: true },
      );
    } catch (err) {
      logger().error(`UPDATE Event Status Betting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusOracleResultSetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          $not: { status: EVENT_STATUS.ORACLE_RESULT_SETTING },
          resultSetStartTime: { $lte: currBlockTime },
          resultSetEndTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.ORACLE_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      logger().error(`UPDATE Event Status Oracle Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusOpenResultSetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          $not: { status: EVENT_STATUS.OPEN_RESULT_SETTING },
          resultSetEndTime: { $lte: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.OPEN_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      logger().error(`UPDATE Event Status Open Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusArbitration(currBlockTime) {
    try {
      await db.Events.update(
        {
          $not: { status: EVENT_STATUS.ARBITRATION },
          arbitrationEndTime: { $gt: currBlockTime },
          currentRound: { $gt: 0 },
        },
        { $set: { status: EVENT_STATUS.ARBITRATION } },
        { multi: true },
      );
    } catch (err) {
      logger().error(`UPDATE Event Status Arbitration error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusWithdrawing(currBlockTime) {
    try {
      await db.Events.update(
        {
          $not: { status: EVENT_STATUS.WITHDRAWING },
          arbitrationEndTime: { $lte: currBlockTime },
          currentRound: { $gt: 0 },
        },
        { $set: { status: EVENT_STATUS.WITHDRAWING } },
        { multi: true },
      );
    } catch (err) {
      logger().error(`UPDATE Event Status Withdrawing error: ${err.message}`);
      throw err;
    }
  }

  /* Bets */
  static async findBet(query) {
    try {
      return await db.Bets.find(query);
    } catch (err) {
      logger().error(`FIND Bet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneBet(query) {
    try {
      return await db.Bets.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Bet error: ${err.message}`);
      throw err;
    }
  }

  static async countBet(query) {
    try {
      return await db.Bets.count(query);
    } catch (err) {
      logger().error(`COUNT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async insertBet(bet) {
    try {
      const existing = await DBHelper.findOneBet({ txid: bet.txid });
      if (isNull(existing)) {
        await db.Bets.insert(bet);
      } else {
        await DBHelper.updateBet(bet);
      }
    } catch (err) {
      logger().error(`INSERT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async updateBet(bet) {
    try {
      await db.Bets.update(
        { txid: bet.txid },
        { $set: bet },
        {},
      );
    } catch (err) {
      logger().error(`UPDATE Bet error: ${err.message}`);
      throw err;
    }
  }

  /* ResultSets */
  static async findResultSet(query) {
    try {
      return await db.ResultSets.find(query);
    } catch (err) {
      logger().error(`FIND ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneResultSet(query) {
    try {
      return await db.ResultSets.findOne(query);
    } catch (err) {
      logger().error(`FINDONE ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async countResultSet(query) {
    try {
      return await db.ResultSets.count(query);
    } catch (err) {
      logger().error(`COUNT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async insertResultSet(resultSet) {
    try {
      const existing = await DBHelper.findOneResultSet({ txid: resultSet.txid });
      if (isNull(existing)) {
        await db.ResultSets.insert(resultSet);
      } else {
        await DBHelper.updateResultSet(resultSet);
      }
    } catch (err) {
      logger().error(`INSERT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async updateResultSet(resultSet) {
    try {
      await db.ResultSets.update(
        { txid: resultSet.txid },
        { $set: resultSet },
        {},
      );
    } catch (err) {
      logger().error(`UPDATE ResultSet error: ${err.message}`);
      throw err;
    }
  }

  /* Withdraws */
  static async findWithdraw(query) {
    try {
      return await db.Withdraws.find(query);
    } catch (err) {
      logger().error(`FIND Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async findOneWithdraw(query) {
    try {
      return await db.Withdraws.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async countWithdraw(query) {
    try {
      return await db.Withdraws.count(query);
    } catch (err) {
      logger().error(`COUNT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async insertWithdraw(withdraw) {
    try {
      const existing = await DBHelper.findOneWithdraw({ txid: withdraw.txid });
      if (isNull(existing)) {
        await db.Withdraws.insert(withdraw);
      } else {
        await DBHelper.updateWithdraw(withdraw);
      }
    } catch (err) {
      logger().error(`INSERT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async updateWithdraw(withdraw) {
    try {
      await db.Withdraws.update(
        { txid: withdraw.txid },
        { $set: withdraw },
        {},
      );
    } catch (err) {
      logger().error(`UPDATE Withdraw error: ${err.message}`);
      throw err;
    }
  }
};
