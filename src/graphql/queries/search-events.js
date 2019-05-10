const {
  buildCursorOptions,
  buildEventFilters,
  buildEventSearchPhrase,
} = require('./utils');

module.exports = async (
  root,
  { searchPhrase, filter, orderBy, limit, skip },
  { db: { Events } },
) => {
  const filters = [];
  if (filter) filters.push({ $or: buildEventFilters(filter) });
  if (searchPhrase) filters.push({ $or: buildEventSearchPhrase(searchPhrase) });

  const query = { $and: filters };
  let cursor = Events.cfind(query);
  cursor = buildCursorOptions(cursor, orderBy, limit, skip);
  return cursor.exec();
};
