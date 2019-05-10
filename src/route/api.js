const { Router } = require('express');
const { each } = require('lodash');

const MultipleResultsEvent = require('../api/multiple-results-event');

const router = Router();

const validateQueryParams = (req, res, params) => {
  let validated = true;
  const queryKeys = Object.keys(req.query);
  each(params, (p) => {
    if (!queryKeys.includes(p)) {
      res.status(422).json({ error: `Missing query param: ${p}` });
      validated = false;
      return false;
    }
    return true;
  });
  return validated;
};

const onRequestSuccess = (res, body, next) => {
  res.status(res.statusCode).send(body);
  next();
};

const onRequestError = (res, err, next) => {
  res.status(500).send({ error: err.message });
  next();
};

/* MultipleResultsEvent */
router.post('/calculate-winnings', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.calculateWinnings(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/version', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.version(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/round', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentRound(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/result-index', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentResultIndex(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/consensus-threshold', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentConsensusThreshold(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/arbitration-end-time', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.currentArbitrationEndTime(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/event-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.eventMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/centralized-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.centralizedMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/config-metadata', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.configMetadata(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/total-bets', (req, res, next) => {
  if (!validateQueryParams(['eventAddress'])) return;

  MultipleResultsEvent.totalBets(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/did-withdraw', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.didWithdraw(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.post('/did-withdraw-escrow', (req, res, next) => {
  if (!validateQueryParams(['eventAddress', 'address'])) return;

  MultipleResultsEvent.didWithdrawEscrow(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
