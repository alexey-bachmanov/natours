const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures');

///// HANDLER FACTORIES /////
exports.createOne = (Model) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { doc: newDoc },
    });
  });
};

exports.deleteOne = (Model, idPath) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params[idPath]);
    if (!doc) return next(new AppError('No document found for that ID', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.patchOne = (Model, idPath) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params[idPath], req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found for that ID', 404));
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });
};

exports.getOne = (Model, idPath, populateOptions) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params[idPath]);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) return next(new AppError('No document found for that ID', 404));
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });
};

exports.getAll = (Model) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    // this is a hack to allow for nested GET requests on tours
    // check if this is a *specific* tour asking for its reviews
    let tourFilter = {};
    if (req.params.tourId) tourFilter = { tour: req.params.tourId };
    // build query
    const queryObj = { ...req.query };
    let query = Model.find(tourFilter);
    // apply filter/sort operations
    query = apiFeatures.filter(query, queryObj);
    query = apiFeatures.sort(query, queryObj);
    query = apiFeatures.project(query, queryObj);
    query = apiFeatures.paginate(query, queryObj);
    // execute query
    const doc = await query;
    // if no errors occured, it's good practice to send a 200 response
    // regardless of whether there are any valid results to send back
    // idk, standard practice 🤷‍♂️
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc },
    });
  });
};
