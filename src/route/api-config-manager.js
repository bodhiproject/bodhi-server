const { Router } = require('express');
const { onRequestSuccess, onRequestError } = require('./utils');
const ConfigManagerApi = require('../api/config-manager');

const router = Router();

router.get('/bodhi-token-address', (req, res, next) => {
  ConfigManagerApi.bodhiTokenAddress()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/event-factory-address', (req, res, next) => {
  ConfigManagerApi.eventFactoryAddress()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/event-escrow-amount', (req, res, next) => {
  ConfigManagerApi.eventEscrowAmount()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/arbitration-length', (req, res, next) => {
  ConfigManagerApi.arbitrationLength()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/starting-consensus-threshold', (req, res, next) => {
  ConfigManagerApi.startingConsensusThreshold()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/threshold-percent-increase', (req, res, next) => {
  ConfigManagerApi.thresholdPercentIncrease()
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

router.get('/is-whitelisted', (req, res, next) => {
  ConfigManagerApi.isWhitelisted(req.query)
    .then((result) => {
      onRequestSuccess(res, result, next);
    }, (err) => {
      onRequestError(res, err, next);
    });
});

module.exports = router;
