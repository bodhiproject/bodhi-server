const EasyGraphQLTester = require('easygraphql-tester');
const {
  MULTIPLE_RESULTS_EVENT,
  PAGINATED_EVENTS,
  PAGINATED_BETS,
  PAGINATED_RESULT_SETS,
  PAGINATED_WITHDRAWS,
} = require('./schema-helper');
const schema = require('../../src/graphql/schema');

const tester = new EasyGraphQLTester(schema);

describe('graphql/mutations', () => {
  describe('add-pending-event', () => {
    it('Pass all arguments', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('Miss txid', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss ownerAddress', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss name', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss results', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss numOfResults', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss centralizedOracle', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss betStartTime', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss betEndTime', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss resultSetStartTime', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss resultSetEndTime', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Miss language', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Txid should be string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: 12
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('ownerAddress should be string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: null
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Name should be string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: 11
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('Results should be string array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: [1, 2]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('numOfResults should be int', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: "2"
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('centralizedOracle should be string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: 1
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('betStartTime should be int', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: "1560965704"
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });
  });

  describe('add-pending-bet', () => {
    it('Pass all arguments', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });
  });

  describe('add-pending-result-set', () => {
    it('Pass all arguments', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });
  });

  describe('add-pending-withdraw', () => {
    it('Pass all arguments', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            betStartTime: 1560965704
            betEndTime: 1560965704
            resultSetStartTime: 1560965704
            resultSetEndTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });
  });
});
