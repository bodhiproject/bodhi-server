const { isArray, each } = require('lodash');
const { lowercaseFilters, buildCursorOptions } = require('./utils');

const buildFilters = ({
  OR,
  txStatus,
  version,
  status,
  language,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = filters.concat(buildFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {};
  if (txStatus) filter.txStatus = txStatus;
  if (version) filter.version = version;
  if (status) filter.status = status;
  if (language) filter.language = language;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

const buildSearchPhrase = (searchPhrase) => {
  if (!searchPhrase) throw Error('Must include searchPhrase');

  const filterFields = ['_id', 'name', 'address', 'centralizedOracle'];
  const filters = [];
  const searchRegex = new RegExp(`.*${searchPhrase}.*`, 'i');
  for (let i = 0; i < filterFields.length; i++) {
    const filter = {};
    filter[filterFields[i]] = { $regex: searchRegex };
    filters.push(filter);
  }

  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip, searchPhrase, includeRoundBets, roundBetsAddress },
  context,
) => {
  const filters = [];
  if (filter) filters.push({ $or: buildFilters(lowercaseFilters(filter)) });
  if (searchPhrase) filters.push({ $or: buildSearchPhrase(searchPhrase) });
  const { db: { Events } } = context;
  context.includeRoundBets = includeRoundBets;
  context.roundBetsAddress = roundBetsAddress;
  const query = { $and: filters };
  let cursor = Events.cfind(query);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);
  return cursor.exec();
};
