const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// MIDDLEWARE FUNCTIONS /////
exports.aliasTopTours = (req, res, next) => {
  req.query.page = '1';
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

///// HANDLERS /////
exports.createTour = factory.createOne(Tour);

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, 'tourId', { path: 'reviews' });

exports.patchTour = factory.patchOne(Tour, 'tourId');

exports.deleteTour = factory.deleteOne(Tour, 'tourId');

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
exports.getTourStats = catchAsync(getTourStatsHandler);
exports.getMonthlyPlan = catchAsync(getMonthlyPlanHandler);
