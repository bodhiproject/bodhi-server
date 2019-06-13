const { sum, fill, each, isNull } = require('lodash');
const Queries = require('./queries');
const Mutations = require('./mutations');
const { TX_TYPE, TX_STATUS } = require('../constants');
const pubsub = require('../route/pubsub');
const DBHelper = require('../db/db-helper');
const { sumBN, sumArrayBN } = require('../utils/web3-utils');
const { toLowerCase } = require('../utils/index');

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
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    pendingTxs: async ({ address }, args, { pendingTxsAddress }) => {
      if (pendingTxsAddress) {
        const bet = await DBHelper.countBet({
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          betterAddress: pendingTxsAddress,
        });
        const resultSet = await DBHelper.countResultSet({
          txStatus: TX_STATUS.PENDING,
          eventAddress: address,
          centralizedOracleAddress: pendingTxsAddress,
        });
        const withdraw = await DBHelper.countWithdraw({
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
      { includeRoundBets, roundBetsAddress },
    ) => {
      if (includeRoundBets) {
        // Fetch all bets for this event
        let bets = await DBHelper.findBet({
          txStatus: TX_STATUS.SUCCESS,
          eventAddress: address,
        });

        const singleTotalRoundBets = [];
        const singleUserRoundBets = [];
        for (let i = 0; i <= currentRound; i++) {
          singleTotalRoundBets.push(fill(Array(numOfResults), '0'));
          singleUserRoundBets.push(fill(Array(numOfResults), '0'));
        }

        const resultSet = await DBHelper.findOneResultSet({
          txStatus: TX_STATUS.SUCCESS,
          eventAddress: address,
          eventRound: 0,
        });

        if (resultSet && resultSet.length !== 0) {
          bets = bets.concat(resultSet);
        }

        each(bets, (bet) => {
          if (!bet.betterAddress) {
            bet.betterAddress = bet.centralizedOracleAddress;
            bet.eventRound = 1;
          }
          if (toLowerCase(roundBetsAddress) === bet.betterAddress) {
            singleUserRoundBets[bet.eventRound][bet.resultIndex] = sumBN(singleUserRoundBets[bet.eventRound][bet.resultIndex], bet.amount)
              .toString(10);
          }
          singleTotalRoundBets[bet.eventRound][bet.resultIndex] = sumBN(singleTotalRoundBets[bet.eventRound][bet.resultIndex], bet.amount)
            .toString(10);
        });

        return {
          singleUserRoundBets,
          singleTotalRoundBets,
        };
      }
      return null;
    },
    previousConsensusThreshold: async ({ address, currentRound }) => {
      if (currentRound >= 1) {
        const resultSet = await DBHelper.findOneResultSet({
          txStatus: TX_STATUS.SUCCESS,
          eventAddress: address,
          eventRound: currentRound - 1,
        });
        return resultSet.amount;
      }
      return null;
    },
    totalBets: async ({ address }) => {
      const bets = await DBHelper.findBet({
        txStatus: TX_STATUS.SUCCESS,
        eventAddress: address,
      });
      const amounts = [];
      each(bets, bet => amounts.push(bet.amount));

      // Add result set amount
      const resultSet = await DBHelper.findOneResultSet({
        txStatus: TX_STATUS.SUCCESS,
        eventAddress: address,
        eventRound: 0,
      });
      if (!isNull(resultSet)) amounts.push(resultSet.amount);

      return sumArrayBN(amounts).toString(10);
    },
  },

  Bet: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    resultName: async ({ eventAddress, resultIndex }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.results[resultIndex];
    },
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },

  ResultSet: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    resultName: async ({ eventAddress, resultIndex }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.results[resultIndex];
    },
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },

  Withdraw: {
    txReceipt: async ({ txid }) =>
      DBHelper.findOneTransactionReceipt({ transactionHash: txid }),
    block: async ({ blockNum }) => DBHelper.findOneBlock({ blockNum }),
    eventName: async ({ eventAddress }) => {
      const event = await DBHelper.findOneEvent({ address: eventAddress });
      return event && event.name;
    },
  },
};
/* eslint-enable object-curly-newline */
