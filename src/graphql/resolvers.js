const { sum } = require('lodash');
const Queries = require('./queries');
const Mutations = require('./mutations');
const { TX_STATUS, TOKEN, STATUS, PHASE, TX_TYPE } = require('../constants');
const pubsub = require('../route/pubsub');
const { DBHelper } = require('../db/db-helper');

/**
 * Takes an oracle object and returns which phase it is in.
 * @param {oracle} oracle
 */
const getPhase = ({ token, status }) => {
  const [BOT, QTUM] = [token === TOKEN.BOT, token === TOKEN.QTUM];

  if (QTUM && [STATUS.VOTING, STATUS.CREATED].includes(status)) return PHASE.BETTING;
  if (BOT && status === STATUS.VOTING) return PHASE.VOTING;
  if (QTUM && [STATUS.WAITRESULT, STATUS.OPENRESULTSET].includes(status)) return PHASE.RESULT_SETTING;
  if ((BOT || QTUM) && status === STATUS.PENDING) return PHASE.PENDING;
  if (BOT && status === STATUS.WAITRESULT) return PHASE.FINALIZING;
  if ((BOT || QTUM) && status === STATUS.WITHDRAW) return PHASE.WITHDRAWING;
  throw Error(`Invalid Phase determined by these -> TOKEN: ${token} STATUS: ${status}`);
};

/* eslint-disable object-curly-newline */
module.exports = {
  Query: Queries,
  Mutation: Mutations,
  Subscription: {
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
  },

  MultipleResultsEvent: {
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

  Vote: {
    block: async ({ blockNum }, data, { db: { Blocks } }) => (await Blocks.find({ blockNum }))[0],
  },

  ResultSet: {
    block: async ({ blockNum }, data, { db: { Blocks } }) => (await Blocks.find({ blockNum }))[0],
  },

  Withdraw: {
    block: async ({ blockNum }, data, { db: { Blocks } }) => (await Blocks.find({ blockNum }))[0],
  },
};
/* eslint-enable object-curly-newline */
