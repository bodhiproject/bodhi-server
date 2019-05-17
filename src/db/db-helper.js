const { isNull } = require('lodash');
const { logger } = require('../utils/logger');
const { EVENT_STATUS } = require('../constants');

module.exports = class DBHelper {
  /* Blocks */
  static async findOneBlock(db, query) {
    try {
      return await db.Blocks.findOne(query);
    } catch (err) {
      logger().error(`FIND Block error: ${err.message}`);
      throw err;
    }
  }

  static async insertBlock(db, blockNum, blockTime) {
    try {
      await db.Blocks.insert({
        _id: blockNum,
        blockNum,
        blockTime: blockTime.toString(),
      });
    } catch (err) {
      logger().error(`INSERT Block error: ${err.message}`);
      throw err;
    }
  }

  /* TransactionReceipts */
  static async findOneTransactionReceipt(db, query) {
    try {
      return await db.TransactionReceipts.findOne(query);
    } catch (err) {
      logger().error(`FIND TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async insertTransactionReceipt(db, txReceipt) {
    try {
      const existing = await DBHelper.findOneTransactionReceipt(
        db,
        { transactionHash: txReceipt.transactionHash },
      );
      if (isNull(existing)) {
        await db.TransactionReceipts.insert(txReceipt);
      } else {
        // Set fields from existing
        txReceipt.gasPrice = existing.gasPrice;
        await DBHelper.updateTransactionReceipt(db, txReceipt);
      }
    } catch (err) {
      logger().error(`INSERT TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async updateTransactionReceipt(db, txReceipt) {
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
  static async findEvent(db, query) {
    try {
      return await db.Events.find(query);
    } catch (err) {
      logger().error(`FIND Event error: ${err.message}`);
      throw err;
    }
  }

  static async findOneEvent(db, query) {
    try {
      return await db.Events.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Event error: ${err.message}`);
      throw err;
    }
  }

  static async insertEvent(db, event) {
    try {
      const existing = await DBHelper.findOneEvent(
        db,
        { txid: event.txid },
      );
      if (isNull(existing)) {
        await db.Events.insert(event);
      } else {
        // Set non-blockchain vars from existing event
        event.language = existing.language;
        await DBHelper.updateEvent(db, event);
      }
    } catch (err) {
      logger().error(`INSERT Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEvent(db, event) {
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

  static async updateEventStatusBetting(db, currBlockTime) {
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

  static async updateEventStatusOracleResultSetting(db, currBlockTime) {
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

  static async updateEventStatusOpenResultSetting(db, currBlockTime) {
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

  static async updateEventStatusArbitration(db, currBlockTime) {
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

  static async updateEventStatusWithdrawing(db, currBlockTime) {
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
  static async findBet(db, query) {
    try {
      return await db.Bets.find(query);
    } catch (err) {
      logger().error(`FIND Bet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneBet(db, query) {
    try {
      return await db.Bets.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Bet error: ${err.message}`);
      throw err;
    }
  }

  static async countBet(db, query) {
    try {
      return await db.Bets.count(query);
    } catch (err) {
      logger().error(`COUNT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async insertBet(db, bet) {
    try {
      const existing = await DBHelper.findOneBet(db, { txid: bet.txid });
      if (isNull(existing)) {
        await db.Bets.insert(bet);
      } else {
        await DBHelper.updateBet(db, bet);
      }
    } catch (err) {
      logger().error(`INSERT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async updateBet(db, bet) {
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
  static async findResultSet(db, query) {
    try {
      return await db.ResultSets.find(query);
    } catch (err) {
      logger().error(`FIND ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneResultSet(db, query) {
    try {
      return await db.ResultSets.findOne(query);
    } catch (err) {
      logger().error(`FINDONE ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async countResultSet(db, query) {
    try {
      return await db.ResultSets.count(query);
    } catch (err) {
      logger().error(`COUNT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async insertResultSet(db, resultSet) {
    try {
      const existing = await DBHelper.findOneResultSet(
        db,
        { txid: resultSet.txid },
      );
      if (isNull(existing)) {
        await db.ResultSets.insert(resultSet);
      } else {
        await DBHelper.updateResultSet(db, resultSet);
      }
    } catch (err) {
      logger().error(`INSERT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async updateResultSet(db, resultSet) {
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
  static async findWithdraw(db, query) {
    try {
      return await db.Withdraws.find(query);
    } catch (err) {
      logger().error(`FIND Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async findOneWithdraw(db, query) {
    try {
      return await db.Withdraws.findOne(query);
    } catch (err) {
      logger().error(`FINDONE Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async countWithdraw(db, query) {
    try {
      return await db.Withdraws.count(query);
    } catch (err) {
      logger().error(`COUNT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async insertWithdraw(db, withdraw) {
    try {
      const existing = await DBHelper.findOneWithdraw(
        db,
        { txid: withdraw.txid },
      );
      if (isNull(existing)) {
        await db.Withdraws.insert(withdraw);
      } else {
        await DBHelper.updateWithdraw(db, withdraw);
      }
    } catch (err) {
      logger().error(`INSERT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async updateWithdraw(db, withdraw) {
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
