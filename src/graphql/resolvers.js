const { sum } = require('lodash');
const Queries = require('./queries');
const Mutations = require('./mutations');
const { TX_STATUS } = require('../constants');
const pubsub = require('../route/pubsub');
const { DBHelper } = require('../db/db-helper');

/* eslint-disable object-curly-newline */
module.exports = {
  Query: Queries,
  Mutation: Mutations,
  Subscription: {
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
  },

  MultipleResultsEvent: {
    block: async ({ blockNum }, data, { db: { Blocks } }) =>
      (await Blocks.find({ blockNum }))[0],
    pendingTxs: async ({ address }, { pendingTxsAddress }, { db }) => {
      if (pendingTxsAddress) {
        const bet = await DBHelper.countBet(db, {
          eventAddress: address,
          betterAddress: pendingTxsAddress,
          txStatus: TX_STATUS.PENDING,
        });
        const resultSet = await DBHelper.countResultSet(db, {
          eventAddress: address,
          centralizedOracleAddress: pendingTxsAddress,
          txStatus: TX_STATUS.PENDING,
        });
        const withdraw = await DBHelper.countWithdraw(db, {
          eventAddress: address,
          winnerAddress: pendingTxsAddress,
          txStatus: TX_STATUS.PENDING,
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
  },

  Bet: {
    block: async ({ blockNum }, data, { db: { Blocks } }) =>
      (await Blocks.find({ blockNum }))[0],
  },

  ResultSet: {
    block: async ({ blockNum }, data, { db: { Blocks } }) =>
      (await Blocks.find({ blockNum }))[0],
  },

  Withdraw: {
    block: async ({ blockNum }, data, { db: { Blocks } }) =>
      (await Blocks.find({ blockNum }))[0],
  },
};
/* eslint-enable object-curly-newline */
