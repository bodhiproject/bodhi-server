const { Router } = require('express');

const AddressManager = require('../api/address-manager');
const BodhiToken = require('../api/bodhi-token');
const Transaction = require('../api/transaction');

const router = Router();

const onRequestSuccess = (res, body, next) => {
  res.status(res.statusCode).send(body);
  next();
};

const onRequestError = (res, err, next) => {
  res.status(500).send({ error: err.message });
  next();
};

/* AddressManager */
router.post('/event-escrow-amount', (req, res, next) => {
  AddressManager.eventEscrowAmount(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/last-event-factory-index', (req, res, next) => {
  AddressManager.getLastEventFactoryIndex(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/last-oracle-factory-index', (req, res, next) => {
  AddressManager.getLastOracleFactoryIndex(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* BodhiToken */
router.post('/approve', (req, res, next) => {
  BodhiToken.approve(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/allowance', (req, res, next) => {
  BodhiToken.allowance(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/bot-balance', (req, res, next) => {
  BodhiToken.balanceOf(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* BaseContract */
router.post('/version', (req, res, next) => {
  BaseContract.version(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/get-result', (req, res, next) => {
  BaseContract.resultIndex(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/bet-balances', (req, res, next) => {
  BaseContract.getBetBalances(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/vote-balances', (req, res, next) => {
  BaseContract.getVoteBalances(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/total-bets', (req, res, next) => {
  BaseContract.getTotalBets(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/total-votes', (req, res, next) => {
  BaseContract.getTotalVotes(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* EventFactory */
router.post('/create-topic', (req, res, next) => {
  EventFactory.createTopic(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/event-factory-version', (req, res, next) => {
  EventFactory.version(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* TopicEvent */
router.post('/withdraw', (req, res, next) => {
  TopicEvent.withdrawWinnings(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/withdraw-escrow', (req, res, next) => {
  TopicEvent.withdrawEscrow(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/total-qtum-value', (req, res, next) => {
  TopicEvent.totalQtumValue(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/total-bot-value', (req, res, next) => {
  TopicEvent.totalBotValue(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/final-result', (req, res, next) => {
  TopicEvent.getFinalResult(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/status', (req, res, next) => {
  TopicEvent.status(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/did-withdraw', (req, res, next) => {
  TopicEvent.didWithdraw(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/winnings', (req, res, next) => {
  TopicEvent.calculateWinnings(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* Oracle */
router.post('/event-address', (req, res, next) => {
  Oracle.eventAddress(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/consensus-threshold', (req, res, next) => {
  Oracle.consensusThreshold(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/finished', (req, res, next) => {
  Oracle.finished(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* CentralizedOracle */
router.post('/bet', (req, res, next) => {
  CentralizedOracle.bet(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/set-result', (req, res, next) => {
  CentralizedOracle.setResult(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/oracle', (req, res, next) => {
  CentralizedOracle.oracle(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/bet-start-block', (req, res, next) => {
  CentralizedOracle.bettingStartBlock(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/bet-end-block', (req, res, next) => {
  CentralizedOracle.bettingEndBlock(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/result-set-start-block', (req, res, next) => {
  CentralizedOracle.resultSettingStartBlock(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/result-set-end-block', (req, res, next) => {
  CentralizedOracle.resultSettingEndBlock(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* DecentralizedOracle */
router.post('/vote', (req, res, next) => {
  DecentralizedOracle.vote(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/finalize-result', (req, res, next) => {
  DecentralizedOracle.finalizeResult(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/arbitration-end-block', (req, res, next) => {
  DecentralizedOracle.arbitrationEndBlock(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/last-result-index', (req, res, next) => {
  DecentralizedOracle.lastResultIndex(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

/* Transactions */
router.post('/transaction-cost', (req, res, next) => {
  Transaction.transactionCost(req.body)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
