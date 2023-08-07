const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
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

const getToursWithinHandler = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  if (!distance || !latlng || !unit)
    return next(
      new AppError('Please provide a distance, center, and unit parameter', 400)
    );
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide a latitude and longitude in the form of lat,lng',
        400
      )
    );

  // mongoDB expects distance in radians, where radius of the earth = 1 rad
  // so radius(rad) = distance(mi) / Rearth(mi)
  // mongoDB also needs a '2dsphere' index for geospatial queries
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  // lat & lng is common input schema
  // lng & lat is geoJSON schema - it's reversed
  // don't forget this time!
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

const getTourDistancesHandler = async (req, res, next) => {
  const { latlng, unit } = req.params;
  if (!latlng || !unit)
    return next(
      new AppError('Please provide a center and unit parameter', 400)
    );
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide a latitude and longitude in the form of lat,lng',
        400
      )
    );

  const distances = await Tour.aggregate([
    // geoNear is the only existing geospatial aggregation step
    // geoNear must be the first step in the aggregation pipeline
    // geoNear needs a geospatial 2dSphere index to work with
    // geoNear returns resulting distances in meters
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: req.params.unit === 'mi' ? 0.000621371 : 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { distances },
  });
};

///// LOAD AND EXPORT HANDLERS /////
// createTour called, which:
// --calls catchAsync, which:
// ----calls handler, which creates response or error
// --errors are caught in .catch and passed to error-handling middleware in app.js
exports.getTourStats = catchAsync(getTourStatsHandler);
exports.getMonthlyPlan = catchAsync(getMonthlyPlanHandler);
exports.getToursWithin = catchAsync(getToursWithinHandler);
exports.getDistances = catchAsync(getTourDistancesHandler);
