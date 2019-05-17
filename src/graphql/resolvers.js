const { sum, fill, each } = require('lodash');
const Queries = require('./queries');
const Mutations = require('./mutations');
const { TX_TYPE, TX_STATUS } = require('../constants');
const pubsub = require('../route/pubsub');
const DBHelper = require('../db/db-helper');
const { sumBN, sumArrayBN } = require('../utils/web3-utils');

/* eslint-disable object-curly-newline */
module.exports = {
  Query: Queries,
  Mutation: Mutations,
  Subscription: {
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
  },

  Transaction: {
    __resolveType: (tx) => {
      switch (tx.txType) {
        case TX_TYPE.CREATE_EVENT: return 'MultipleResultsEvent';
        case TX_TYPE.BET: return 'Bet';
        case TX_TYPE.RESULT_SET: return 'ResultSet';
        case TX_TYPE.VOTE: return 'Bet';
        case TX_TYPE.WITHDRAW: return 'Withdraw';
        default: return null;
      }
    },
  },

  MultipleResultsEvent: {
    txReceipt: async ({ txid }, args, { db }) =>
      DBHelper.findOneTransactionReceipt(db, { transactionHash: txid }),
    block: async ({ blockNum }, args, { db }) =>
      DBHelper.findOneBlock(db, { blockNum }),
    pendingTxs: async ({ address }, args, { db, pendingTxsAddress }) => {
      if (pendingTxsAddress) {
        const bet = await DBHelper.countBet(db, {
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          betterAddress: pendingTxsAddress,
        });
        const resultSet = await DBHelper.countResultSet(db, {
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          centralizedOracleAddress: pendingTxsAddress,
        });
        const withdraw = await DBHelper.countWithdraw(db, {
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          winnerAddress: pendingTxsAddress,
        });
        return {
          bet,
          resultSet,
          withdraw,
          total: sum([bet, resultSet, withdraw]),
        };
      }
      return null;
    },
    roundBets: async (
      { address, currentRound, numOfResults },
      args,
      { db, includeRoundBets },
    ) => {
      if (includeRoundBets) {
        // Fetch all bets for this round
        const bets = await DBHelper.findBet(db, {
          txStatus: TX_STATUS.SUCCESS,
          eventAddress: address,
          eventRound: currentRound,
        });

        // Sum all bets by index
        const rounds = fill(Array(numOfResults), '0');
        each(bets, (bet) => {
          rounds[bet.resultIndex] = sumBN(rounds[bet.resultIndex], bet.amount)
            .toString(10);
        });
        return rounds;
      }
      return null;
    },
    totalBets: async ({ address }, args, { db }) => {
      const bets = await DBHelper.findBet(db, {
        txStatus: TX_STATUS.SUCCESS,
        eventAddress: address,
      });
      const amounts = [];
      each(bets, bet => amounts.push(bet.amount));
      return sumArrayBN(amounts).toString(10);
    },
  },

  Bet: {
    txReceipt: async ({ txid }, args, { db }) =>
      DBHelper.findOneTransactionReceipt(db, { transactionHash: txid }),
    block: async ({ blockNum }, args, { db }) =>
      DBHelper.findOneBlock(db, { blockNum }),
  },

  ResultSet: {
    txReceipt: async ({ txid }, args, { db }) =>
      DBHelper.findOneTransactionReceipt(db, { transactionHash: txid }),
    block: async ({ blockNum }, args, { db }) =>
      DBHelper.findOneBlock(db, { blockNum }),
    resultName: async ({ eventAddress, resultIndex }, args, { db }) => {
      const event = await DBHelper.findOneEvent(db, { address: eventAddress });
      return event && event.results[resultIndex];
    },
  },

  Withdraw: {
    txReceipt: async ({ txid }, args, { db }) =>
      DBHelper.findOneTransactionReceipt(db, { transactionHash: txid }),
    block: async ({ blockNum }, args, { db }) =>
      DBHelper.findOneBlock(db, { blockNum }),
  },
};
/* eslint-enable object-curly-newline */
