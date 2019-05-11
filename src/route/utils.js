const { each } = require('lodash');

module.exports = {
  onRequestSuccess: (res, body, next) => {
    res.status(res.statusCode).send(body);
    next();
  },

  onRequestError: (res, err, next) => {
    res.status(500).send({ error: err.message });
    next();
  },

  validateQueryParams: (req, res, params) => {
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
  },
};
