const _ = require('lodash');

const Queries = require('./queries');
const Mutations = require('./mutations');
const { PHASE, TX_TYPE } = require('../constants');
const pubsub = require('../route/pubsub');

const {
  APPROVECREATEEVENT,
  CREATEEVENT,
  BET,
  APPROVESETRESULT,
  SETRESULT,
  APPROVEVOTE,
  VOTE,
  FINALIZERESULT,
  WITHDRAW,
  WITHDRAWESCROW,
} = TX_TYPE;

/**
 * Takes an oracle object and returns which phase it is in.
 * @param {oracle} oracle
 */
const getPhase = ({ token, status }) => {
  const [BOT, QTUM] = [token === 'BOT', token === 'QTUM'];
  if (QTUM && ['VOTING', 'CREATED'].includes(status)) return PHASE.BETTING;
  if (BOT && status === 'VOTING') return PHASE.VOTING;
  if (QTUM && ['WAITRESULT', 'OPENRESULTSET'].includes(status)) return PHASE.RESULT_SETTING;
  if ((BOT || QTUM) && status === 'PENDING') return PHASE.PENDING;
  if (BOT && status === 'WAITRESULT') return PHASE.FINALIZING;
  if ((BOT || QTUM) && status === 'WITHDRAW') return PHASE.WITHDRAWING;
  throw Error(`Invalid Phase determined by these -> TOKEN: ${token} STATUS: ${status}`);
};

module.exports = {
  Query: Queries,
  Mutation: Mutations,

  Topic: {
    oracles: ({ address }, data, { db: { Oracles } }) => Oracles.find({ topicAddress: address }),
    transactions: async ({ address }, data, { db: { Transactions } }) => {
      const types = [{ type: WITHDRAWESCROW }, { type: WITHDRAW }];
      return Transactions.find({ topicAddress: address, $or: types });
    },
  },

  Oracle: {
    transactions: (oracle, data, { db: { Transactions } }) => {
      const calculatedPhase = getPhase(oracle);
      let types = [];
      switch (calculatedPhase) {
        case PHASE.PENDING:
          // Oracles in PENDING phase don't have any transactions to query
          return [];
        case PHASE.BETTING:
          types = [{ type: BET }, { type: CREATEEVENT }, { type: APPROVECREATEEVENT }];
          break;
        case PHASE.RESULT_SETTING:
          types = [{ type: SETRESULT }, { type: APPROVESETRESULT }];
          break;
        case PHASE.VOTING:
          types = [{ type: VOTE }, { type: APPROVEVOTE }];
          break;
        case PHASE.FINALIZING:
          types = [{ type: FINALIZERESULT }];
          break;
        case PHASE.WITHDRAWING:
          types = [{ type: WITHDRAW }];
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
    onSyncInfo: { subscribe: () => pubsub.asyncIterator('onSyncInfo') },
    onApproveSuccess: { subscribe: () => pubsub.asyncIterator('onApproveSuccess') },
  },
};
