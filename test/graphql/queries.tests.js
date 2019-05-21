const EasyGraphQLTester = require('easygraphql-tester');
const { PAGINATED_EVENTS, PAGINATED_BETS } = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('queries', () => {
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
            { version: 0 }
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
          events(filter: { version: 0 }) {
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
});
