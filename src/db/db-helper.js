const { isNull } = require('lodash');
const logger = require('../utils/logger');
const { EVENT_STATUS, TX_STATUS } = require('../constants');
const { isDefined } = require('../utils');
const { db } = require('.');

module.exports = class DBHelper {
  /* Blocks */
  static async findOneBlock(query) {
    try {
      return db.Blocks.findOne(query);
    } catch (err) {
      logger.error(`FIND Block error: ${err.message}`);
      throw err;
    }
  }

  static async findLatestBlock() {
    return db.Blocks.cfind({}).sort({ blockNum: -1 }).limit(1).exec();
  }

  static async insertBlock(blockNum, blockTime) {
    try {
      const existing = await DBHelper.findOneBlock({ blockNum });
      if (!isNull(existing)) return;

      await db.Blocks.insert({
        _id: blockNum,
        blockNum,
        blockTime,
      });
    } catch (err) {
      logger.error(`INSERT Block error: ${err.message}`);
      throw err;
    }
  }

  /* TransactionReceipts */
  static async findOneTransactionReceipt(query) {
    try {
      return db.TransactionReceipts.findOne(query);
    } catch (err) {
      logger.error(`FIND TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  static async insertTransactionReceipt(txReceipt) {
    try {
      const existing =
        await DBHelper.findOneTransactionReceipt({ transactionHash: txReceipt.transactionHash });
      if (isNull(existing)) {
        await db.TransactionReceipts.insert(txReceipt);
      } else {
        // Set fields from existing
        txReceipt.gasPrice = existing.gasPrice;
        await DBHelper.updateTransactionReceipt(txReceipt);
      }
    } catch (err) {
      logger.error(`INSERT TransactionReceipt error: ${err.message}`);
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
      logger.error(`UPDATE TransactionReceipt error: ${err.message}`);
      throw err;
    }
  }

  /* Events */
  static async findEvent(query, sort) {
    try {
      if (sort) return db.Events.cfind(query).sort(sort).exec();
      return db.Events.find(query);
    } catch (err) {
      logger.error(`FIND Event error: ${err.message}`);
      throw err;
    }
  }

  static async findOneEvent(query) {
    try {
      return db.Events.findOne(query);
    } catch (err) {
      logger.error(`FINDONE Event error: ${err.message}`);
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
        await DBHelper.updateEvent(event.txid, event);
      }
    } catch (err) {
      logger.error(`INSERT Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEvent(txid, fields) {
    try {
      await db.Events.update({ txid }, { $set: fields }, {});
    } catch (err) {
      logger.error(`UPDATE Event error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusPreBetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.PRE_BETTING },
          betStartTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.PRE_BETTING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Pre Betting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventByAddress(address, fields) {
    try {
      await db.Events.update({ address }, { $set: fields }, {});
    } catch (err) {
      logger.error(`UPDATE Event By Address error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusBetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.BETTING },
          betStartTime: { $lte: currBlockTime },
          betEndTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.BETTING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Betting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusPreResultSetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.PRE_RESULT_SETTING },
          betEndTime: { $lte: currBlockTime },
          resultSetStartTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.PRE_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Pre Result Setting error: ${err.message}`);
    }
  }

  static async updateEventStatusOracleResultSetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.ORACLE_RESULT_SETTING },
          resultSetStartTime: { $lte: currBlockTime },
          resultSetEndTime: { $gt: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.ORACLE_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Oracle Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusOpenResultSetting(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.OPEN_RESULT_SETTING },
          resultSetEndTime: { $lte: currBlockTime },
          currentRound: 0,
        },
        { $set: { status: EVENT_STATUS.OPEN_RESULT_SETTING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Open Result Setting error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusArbitration(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.ARBITRATION },
          arbitrationEndTime: { $gt: currBlockTime },
          currentRound: { $gt: 0 },
        },
        { $set: { status: EVENT_STATUS.ARBITRATION } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Arbitration error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventStatusWithdrawing(currBlockTime) {
    try {
      await db.Events.update(
        {
          txStatus: TX_STATUS.SUCCESS,
          $not: { status: EVENT_STATUS.WITHDRAWING },
          arbitrationEndTime: { $lte: currBlockTime },
          currentRound: { $gt: 0 },
        },
        { $set: { status: EVENT_STATUS.WITHDRAWING } },
        { multi: true },
      );
    } catch (err) {
      logger.error(`UPDATE Event Status Withdrawing error: ${err.message}`);
      throw err;
    }
  }

  static async updateEventWithdrawnList(withdraw) {
    try {
      const event = await DBHelper.findOneEvent({ address: withdraw.eventAddress });
      if (isNull(event)) {
        logger.error('UPDATE Event withdrawnList error: event does not exist');
        return;
      }
      if (!isDefined(event.withdrawnList)) event.withdrawnList = [];
      if (event.withdrawnList.includes(withdraw.winnerAddress)) {
        logger.error('UPDATE Event withdrawnList error: user already withdrawn');
        return;
      }
      event.withdrawnList.push(withdraw.winnerAddress);

      await DBHelper.updateEvent(
        event.txid,
        { withdrawnList: event.withdrawnList },
      );
    } catch (err) {
      logger.error(`UPDATE Event withdrawnList error: ${err.message}`);
      throw err;
    }
  }

  /* Bets */
  static async findBet(query, sort) {
    try {
      if (sort) return db.Bets.cfind(query).sort(sort).exec();
      return db.Bets.find(query);
    } catch (err) {
      logger.error(`FIND Bet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneBet(query) {
    try {
      return db.Bets.findOne(query);
    } catch (err) {
      logger.error(`FINDONE Bet error: ${err.message}`);
      throw err;
    }
  }

  static async countBet(query) {
    try {
      return db.Bets.count(query);
    } catch (err) {
      logger.error(`COUNT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async insertBet(bet) {
    try {
      const existing = await DBHelper.findOneBet({ txid: bet.txid });
      if (isNull(existing)) {
        await db.Bets.insert(bet);
      } else {
        await DBHelper.updateBet(bet.txid, bet);
      }
    } catch (err) {
      logger.error(`INSERT Bet error: ${err.message}`);
      throw err;
    }
  }

  static async updateBet(txid, fields) {
    try {
      await db.Bets.update({ txid }, { $set: fields }, {});
    } catch (err) {
      logger.error(`UPDATE Bet error: ${err.message}`);
      throw err;
    }
  }

  /* ResultSets */
  static async findResultSet(query, sort) {
    try {
      if (sort) return db.ResultSets.cfind(query).sort(sort).exec();
      return db.ResultSets.find(query);
    } catch (err) {
      logger.error(`FIND ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async findOneResultSet(query) {
    try {
      return db.ResultSets.findOne(query);
    } catch (err) {
      logger.error(`FINDONE ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async findLatestResultSet(query) {
    return db.ResultSets.cfind(query).sort({ blockNum: -1 }).limit(1).exec();
  }

  static async countResultSet(query) {
    try {
      return db.ResultSets.count(query);
    } catch (err) {
      logger.error(`COUNT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async insertResultSet(resultSet) {
    try {
      const existing = await DBHelper.findOneResultSet({ txid: resultSet.txid });
      if (isNull(existing)) {
        await db.ResultSets.insert(resultSet);
      } else {
        await DBHelper.updateResultSet(resultSet.txid, resultSet);
      }
    } catch (err) {
      logger.error(`INSERT ResultSet error: ${err.message}`);
      throw err;
    }
  }

  static async updateResultSet(txid, fields) {
    try {
      await db.ResultSets.update({ txid }, { $set: fields }, {});
    } catch (err) {
      logger.error(`UPDATE ResultSet error: ${err.message}`);
      throw err;
    }
  }

  /* Withdraws */
  static async findWithdraw(query, sort) {
    try {
      if (sort) return db.Withdraws.cfind(query).sort(sort).exec();
      return db.Withdraws.find(query);
    } catch (err) {
      logger.error(`FIND Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async findOneWithdraw(query) {
    try {
      return db.Withdraws.findOne(query);
    } catch (err) {
      logger.error(`FINDONE Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async countWithdraw(query) {
    try {
      return db.Withdraws.count(query);
    } catch (err) {
      logger.error(`COUNT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async insertWithdraw(withdraw) {
    try {
      const existing = await DBHelper.findOneWithdraw({ txid: withdraw.txid });
      if (isNull(existing)) {
        await db.Withdraws.insert(withdraw);
      } else {
        await DBHelper.updateWithdraw(withdraw.txid, withdraw);
      }
    } catch (err) {
      logger.error(`INSERT Withdraw error: ${err.message}`);
      throw err;
    }
  }

  static async updateWithdraw(txid, fields) {
    try {
      await db.Withdraws.update({ txid }, { $set: fields }, {});
    } catch (err) {
      logger.error(`UPDATE Withdraw error: ${err.message}`);
      throw err;
    }
  }
};
