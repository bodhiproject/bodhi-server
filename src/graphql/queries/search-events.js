const { buildCursorOptions } = require('./utils');

const buildFilters = ({
  OR = [],
  txid,
  address,
  ownerAddress,
  resultIndex,
  status,
  language,
}) => {
  const filter = (
    txid
    || address
    || ownerAddress
    || resultIndex
    || status
    || language
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (address) filter.address = address;
  if (ownerAddress) filter.ownerAddress = ownerAddress;
  if (status) filter.status = status;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (language) filter.language = language;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
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
