exports.filter = function (query, requestQueryObject) {
  const queryObj = { ...requestQueryObject };
  // filter out keywords for sorting/projecting/pagination
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((el) => delete queryObj[el]);
  // translate operators to mongo strings (...&price[lte]=500)
  // 'lte' => '$lte'
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte)\b/g,
    (matchedStr) => `$${matchedStr}`
  );
  return query.find(JSON.parse(queryStr));
};
exports.sort = function (query, requestQueryObject) {
  // sorting (...&sort=price,ratingsAverage)
  if (requestQueryObject.sort) {
    const sortBy = requestQueryObject.sort.split(',').join(' ');
    return query.sort(sortBy);
  } else {
    return query.sort('-createdAt');
  }
};
exports.project = function (query, requestQueryObject) {
  // projecting - limiting returned fields (...&fields=name,price)
  if (requestQueryObject.fields) {
    const fields = requestQueryObject.fields.split(',').join(' ');
    return query.select(fields);
  } else {
    return query.select('-__v'); // never return __v field (used by mongo internally)
  }
};
exports.paginate = function (query, requestQueryObject) {
  // pagination (...&page=2&limit=4)
  const page = Number(requestQueryObject.page) || 1;
  const limit = Number(requestQueryObject.limit) || 100;
  skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};
