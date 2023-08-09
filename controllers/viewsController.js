const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

///// HANDLERS /////
const getOverviewHandler = async (req, res, next) => {
  // get tour data from collection
  const tours = await Tour.find();
  // render that template using tour data
  res.status(200).render('overview', { tours });
};

const getTourHandler = async (req, res, next) => {
  // get tour data for the requested tour (inc. reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // render that template using tour data
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
  // res.status(200).json(tour);
};

const getLoginFormHandler = async (req, res, next) => {
  res.status(200).render('login', { title: 'Log in' });
};

///// LOAD AND EXPORT HANDLERS /////
exports.getOverview = catchAsync(getOverviewHandler);
exports.getTour = catchAsync(getTourHandler);
exports.getLoginForm = catchAsync(getLoginFormHandler);
