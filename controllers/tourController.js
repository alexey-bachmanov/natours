const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures');

///// MIDDLEWARE FUNCTIONS /////
exports.aliasTopTours = (req, res, next) => {
  req.query.page = '1';
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.checkID = async (req, res, next) => {
  try {
    // is the ID valid ?
    if (!mongoose.isObjectIdOrHexString(req.params.tourId))
      // call next() with an error in the args, so code skips to global error
      // handling middleware in app.js
      return next(new AppError('No tour found for that ID', 404));
    // does a valid tour exist with that ID?
    const tourExists = await Tour.exists({ _id: req.params.tourId });
    if (!tourExists)
      return next(new AppError('No tour found for that ID', 404));
  } catch (error) {
    next(error);
  }
  next();
};

///// HANDLERS /////
const createTourHandler = async (req, res, next) => {
  // sanitize inputs
  if (req.body._id) delete req.body._id;
  if (req.body.id) delete req.body.id;
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
};

const getAllToursHandler = async (req, res, next) => {
  // build query
  const queryObj = { ...req.query };
  let query = Tour.find();
  // apply filter/sort operations
  query = apiFeatures.filter(query, queryObj);
  query = apiFeatures.sort(query, queryObj);
  query = apiFeatures.project(query, queryObj);
  query = apiFeatures.paginate(query, queryObj);
  // execute query
  const tours = await query;
  // if no errors occured, it's good practice to send a 200 response
  // regardless of whether there are any valid results to send back
  // idk, standard practice 🤷‍♂️
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

const getTourHandler = async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId).populate('reviews');
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const patchTourHandler = async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const deleteTourHandler = async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.tourId);
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getTourStatsHandler = async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 0 },
      },
    },
    {
      $group: {
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
};

const getMonthlyPlanHandler = async (req, res, next) => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: { $gte: new Date(`${year}-01-01`) },
        startDates: { $lte: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: false,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
    {
      // this does nothing, just left for reference
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
};

///// LOAD AND EXPORT HANDLERS /////
// createTour called, which:
// --calls catchAsync, which:
// ----calls handler, which creates response or error
// --errors are caught in .catch and passed to error-handling middleware in app.js
exports.createTour = catchAsync(createTourHandler);
exports.getAllTours = catchAsync(getAllToursHandler);
exports.getTour = catchAsync(getTourHandler);
exports.patchTour = catchAsync(patchTourHandler);
exports.deleteTour = catchAsync(deleteTourHandler);
exports.getTourStats = catchAsync(getTourStatsHandler);
exports.getMonthlyPlan = catchAsync(getMonthlyPlanHandler);
