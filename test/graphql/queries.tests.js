const EasyGraphQLTester = require('easygraphql-tester');
const {
  MULTIPLE_RESULTS_EVENT,
  PAGINATED_EVENTS,
  PAGINATED_BETS,
  PAGINATED_RESULT_SETS,
  PAGINATED_WITHDRAWS,
  PAGINATED_LEADERBOARD,
} = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('graphql/queries', () => {
  describe('events', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          events {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the OR filter', async () => {
      const valid = `
        query {
          events(filter: { OR: [
            { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { txStatus: SUCCESS }
            { address: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { versions: [0] }
            { centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { currentRound: 0 }
            { currentResultIndex: 0 }
            { status: BETTING }
            { language: "en-US" }
            { excludeCentralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
          ] }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txid filter', async () => {
      const valid = `
        query {
          events(filter: { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txStatus filter', async () => {
      const valid = `
        query {
          events(filter: { txStatus: SUCCESS }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the address filter', async () => {
      const valid = `
        query {
          events(filter: { address: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the ownerAddress filter', async () => {
      const valid = `
        query {
          events(filter: { ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the version filter', async () => {
      const valid = `
        query {
          events(filter: { versions: [0] }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the centralizedOracle filter', async () => {
      const valid = `
        query {
          events(filter: { centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the currentRound filter', async () => {
      const valid = `
        query {
          events(filter: { currentRound: 0 }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the currentResultIndex filter', async () => {
      const valid = `
        query {
          events(filter: { currentResultIndex: 0 }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the status filter', async () => {
      const valid = `
        query {
          events(filter: { status: BETTING }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the language filter', async () => {
      const valid = `
        query {
          events(filter: { language: "en-US" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the excludeCentralizedOracle filter', async () => {
      const valid = `
        query {
          events(filter: { excludeCentralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_EVENTS}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('searchEvents', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          searchEvents {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('bets', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          bets {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the OR filter', async () => {
      const valid = `
        query {
          bets(filter: { OR: [
            { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { txStatus: SUCCESS }
            { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { resultIndex: 0 }
            { eventRound: 0 }
          ] }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txid filter', async () => {
      const valid = `
        query {
          bets(filter: { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txStatus filter', async () => {
      const valid = `
        query {
          bets(filter: { txStatus: SUCCESS }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          bets(filter: { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the betterAddress filter', async () => {
      const valid = `
        query {
          bets(filter: { betterAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the resultIndex filter', async () => {
      const valid = `
        query {
          bets(filter: { resultIndex: 0 }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventRound filter', async () => {
      const valid = `
        query {
          bets(filter: { eventRound: 0 }) {
            ${PAGINATED_BETS}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('resultSets', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          resultSets {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the OR filter', async () => {
      const valid = `
        query {
          resultSets(filter: { OR: [
            { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { txStatus: SUCCESS }
            { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { resultIndex: 0 }
            { eventRound: 0 }
          ] }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txid filter', async () => {
      const valid = `
        query {
          resultSets(filter: { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txStatus filter', async () => {
      const valid = `
        query {
          resultSets(filter: { txStatus: SUCCESS }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          resultSets(filter: { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the centralizedOracleAddress filter', async () => {
      const valid = `
        query {
          resultSets(filter: { centralizedOracleAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the resultIndex filter', async () => {
      const valid = `
        query {
          resultSets(filter: { resultIndex: 0 }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventRound filter', async () => {
      const valid = `
        query {
          resultSets(filter: { eventRound: 0 }) {
            ${PAGINATED_RESULT_SETS}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('withdraws', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          withdraws {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the OR filter', async () => {
      const valid = `
        query {
          withdraws(filter: { OR: [
            { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { txStatus: SUCCESS }
            { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
            { winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }
          ] }) {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txid filter', async () => {
      const valid = `
        query {
          withdraws(filter: { txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the txStatus filter', async () => {
      const valid = `
        query {
          withdraws(filter: { txStatus: SUCCESS }) {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          withdraws(filter: { eventAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the winnerAddress filter', async () => {
      const valid = `
        query {
          withdraws(filter: { winnerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428" }) {
            ${PAGINATED_WITHDRAWS}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('eventLeaderboard', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          eventLeaderboardEntries(filter: {
            userAddress:"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a",
            eventAddress:"0x09645ea6e4e1f5375f7596b73b3b597e6507201a"
          }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          eventLeaderboardEntries(filter: { eventAddress: "0x09645ea6e4e1f5375f7596b73b3b597e6507201a" }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the userAddress filter', async () => {
      const valid = `
        query {
          eventLeaderboardEntries(filter: { userAddress:"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a" }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });
  });

  describe('globalLeaderboard', () => {
    it('should return the query', async () => {
      const valid = `
        query {
          globalLeaderboardEntries(filter: {
            userAddress:"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a",
            eventAddress:"0x09645ea6e4e1f5375f7596b73b3b597e6507201a"
          }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the eventAddress filter', async () => {
      const valid = `
        query {
          globalLeaderboardEntries(filter: { eventAddress: "0x09645ea6e4e1f5375f7596b73b3b597e6507201a" }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });

    it('should accept the userAddress filter', async () => {
      const valid = `
        query {
          globalLeaderboardEntries(filter: { userAddress:"0x939592864c0bd3355b2d54e4fa2203e8343b6d6a" }) {
            ${PAGINATED_LEADERBOARD}
          }
        }
      `;
      tester.test(true, valid);
    });
  });
});
