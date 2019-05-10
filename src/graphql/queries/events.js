const { runPaginatedQuery } = require('./utils');

const buildFilters = ({
  OR = [],
  txid,
  address,
  ownerAddress,
  resultIndex,
  hashId,
  status,
  language,
}) => {
  const filter = (
    txid
    || address
    || ownerAddress
    || resultIndex
    || hashId
    || status
    || language
  ) ? {} : null;

  if (txid) filter.txid = txid;
  if (address) filter.address = address;
  if (ownerAddress) filter.ownerAddress = ownerAddress;
  if (status) filter.status = status;
  if (resultIndex) filter.resultIndex = resultIndex;
  if (hashId) filter.hashId = hashId;
  if (language) filter.language = language;

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
};

module.exports = async (
  root,
  { filter, orderBy, limit, skip },
  { db: { Events } },
) => {
  const query = filter ? { $or: buildFilters(filter) } : {};
  return runPaginatedQuery({
    db: Events,
    filter: query,
    orderBy,
    limit,
    skip,
  });
};
