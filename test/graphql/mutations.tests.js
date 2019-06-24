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
    it('It passes all arguments', async () => {
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
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(true, valid, {});
    });

    it('It should fail if txid missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if ownerAddress missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if name missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if results missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if numOfResults missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if centralizedOracle missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
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

    it('It should fail if betEndTime missed', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            resultSetStartTime: 1560965704
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if resultSetStartTime missed', async () => {
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
            language: "en-US"
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if language missed', async () => {
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
          ) {
            ${MULTIPLE_RESULTS_EVENT}
          }
        }
      `;
      tester.test(false, valid, {});
    });

    it('It should fail if txid is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: null
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if txid is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: 1
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if txid is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if txid is an object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if ownerAddress is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: null
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if ownerAddress is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: 1
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if ownerAddress is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if ownerAddress is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if name is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: null
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if name is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: 1
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if name is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: ["a"]
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if name is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: {id: "a"}
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if results is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: null
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if results is number array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: [1, 2]
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if results is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: {id: "1"}
            numOfResults: 2
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if numOfResults is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: null
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if numOfResults is string', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: "2"
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if numOfResults is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: ["2"]
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if numOfResults is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: {id: "2"}
            centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
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

    it('It should fail if centralizedOracle is null', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: null
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

    it('It should fail if centralizedOracle is number', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: 1
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

    it('It should fail if centralizedOracle is array', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: ["0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"]
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

    it('It should fail if centralizedOracle is object', async () => {
      const valid = `
        mutation {
          addPendingEvent(
            txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
            name: "General test"
            results: ["1", "2"]
            numOfResults: 2
            centralizedOracle: {id: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"}
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
  });

  // describe('add-pending-bet', () => {
  //   it('Pass all arguments', async () => {
  //     const valid = `
  //       mutation {
  //         addPendingEvent(
  //           txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           name: "General test"
  //           results: ["1", "2"]
  //           numOfResults: 2
  //           centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           betStartTime: 1560965704
  //           betEndTime: 1560965704
  //           resultSetStartTime: 1560965704
  //           resultSetEndTime: 1560965704
  //           language: "en-US"
  //         ) {
  //           ${MULTIPLE_RESULTS_EVENT}
  //         }
  //       }
  //     `;
  //     tester.test(true, valid, {});
  //   });
  // });

  // describe('add-pending-result-set', () => {
  //   it('Pass all arguments', async () => {
  //     const valid = `
  //       mutation {
  //         addPendingEvent(
  //           txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           name: "General test"
  //           results: ["1", "2"]
  //           numOfResults: 2
  //           centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           betStartTime: 1560965704
  //           betEndTime: 1560965704
  //           resultSetStartTime: 1560965704
  //           resultSetEndTime: 1560965704
  //           language: "en-US"
  //         ) {
  //           ${MULTIPLE_RESULTS_EVENT}
  //         }
  //       }
  //     `;
  //     tester.test(true, valid, {});
  //   });
  // });

  // describe('add-pending-withdraw', () => {
  //   it('Pass all arguments', async () => {
  //     const valid = `
  //       mutation {
  //         addPendingEvent(
  //           txid: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           ownerAddress: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           name: "General test"
  //           results: ["1", "2"]
  //           numOfResults: 2
  //           centralizedOracle: "0xd5d087daabc73fc6cc5d9c1131b93acbd53a2428"
  //           betStartTime: 1560965704
  //           betEndTime: 1560965704
  //           resultSetStartTime: 1560965704
  //           resultSetEndTime: 1560965704
  //           language: "en-US"
  //         ) {
  //           ${MULTIPLE_RESULTS_EVENT}
  //         }
  //       }
  //     `;
  //     tester.test(true, valid, {});
  //   });
  // });
});
