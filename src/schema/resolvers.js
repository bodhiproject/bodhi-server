const _ = require('lodash');

const Queries = require('./queries');
const Mutations = require('./mutations');
const pubsub = require('../pubsub');

/**
 * Takes an oracle object and returns which phase it is in.
 * @param {oracle} oracle
 */
const getPhase = ({ token, status }) => {
  const [BOT, QTUM] = [token === 'BOT', token === 'QTUM'];
  if (QTUM && ['VOTING', 'CREATED'].includes(status)) return phase.BETTING;
  if (BOT && status === 'VOTING') return phase.VOTING;
  if (QTUM && ['WAITRESULT', 'OPENRESULTSET'].includes(status)) return phase.RESULT_SETTING;
  if ((BOT || QTUM) && status === 'PENDING') return phase.PENDING;
  if (BOT && status === 'WAITRESULT') return phase.FINALIZING;
  if ((BOT || QTUM) && status === 'WITHDRAW') return phase.WITHDRAWING;
  throw Error(`Invalid Phase determined by these -> TOKEN: ${token} STATUS: ${status}`);
};

module.exports = {
  Query: Queries,
  Mutation: Mutations,

  Topic: {
    oracles: ({ address }, data, { db: { Oracles } }) => Oracles.find({ topicAddress: address }),
    transactions: async ({ address }, data, { db: { Transactions } }) => {
      const types = [{ type: 'WITHDRAWESCROW' }, { type: 'WITHDRAW' }];
      return Transactions.find({ topicAddress: address, $or: types });
    },
  },

  Oracle: {
    transactions: (oracle, data, { db: { Transactions } }) => {
      const calculatedPhase = getPhase(oracle);
      let types = [];
      switch (calculatedPhase) {
        case phase.BETTING:
          types = [{ type: 'BET' }, { type: 'CREATEEVENT' }, { type: 'APPROVECREATEEVENT' }];
          break;
        case phase.VOTING:
          types = [{ type: 'VOTE' }, { type: 'APPROVEVOTE' }];
          break;
        case phase.RESULT_SETTING:
          types = [{ type: 'SETRESULT' }, { type: 'APPROVESETRESULT' }];
          break;
        case phase.PENDING:
          // Oracles in PENDING phase don't have any transactions to query
          return [];
        case phase.FINALIZING:
          types = [{ type: 'FINALIZERESULT' }];
          break;
        case phase.WITHDRAWING:
          types = [{ type: 'WITHDRAW' }];
          break;
        default:
          throw Error(`Invalid phase: ${calculatedPhase}`);
      }
      return Transactions.find({ oracleAddress: oracle.address, $or: types });
    },
  },

  Transaction: {
    topic: async ({ topicAddress }, data, { db: { Topics } }) => {
      if (_.isEmpty(topicAddress)) {
        return null;
      }

      const topics = await Topics.find({ address: topicAddress });
      if (!_.isEmpty(topics)) {
        return topics[0];
      }
      return null;
    },
  },

  Subscription: {
    onSyncInfo: {
      subscribe: () => pubsub.asyncIterator('onSyncInfo'),
    },
  },
};
