const { isArray, each, merge } = require('lodash');
const { buildCursorOptions } = require('./utils');

const buildFilters = ({
  OR,
  txid,
  address,
  ownerAddress,
  resultIndex,
  status,
  language,
} = {}) => {
  let filters = [];

  // Handle OR array
  if (isArray(OR)) {
    each(OR, (f) => {
      filters = merge(filters, buildFilters(f));
    });
    return filters;
  }

  // Handle other fields
  const filter = {};
  if (txid) filter.txid = txid;
  if (address) filter.address = address;
  if (ownerAddress) filter.ownerAddress = ownerAddress;
  if (status) filter.status = status;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (language) filter.language = language;
  if (Object.keys(filter).length > 0) filters.push(filter);
  return filters;
};

const buildSearchPhrase = (searchPhrase) => {
  const filterFields = ['_id', 'name', 'address', 'centralizedOracle'];
  if (!searchPhrase) return [];

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
  { searchPhrase, filter, orderBy, limit, skip },
  { db: { Events } },
) => {
  const filters = [];
  if (filter) filters.push({ $or: buildFilters(filter) });
  if (searchPhrase) filters.push({ $or: buildSearchPhrase(searchPhrase) });

  const query = { $and: filters };
  let cursor = Events.cfind(query);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);
  return cursor.exec();
};
