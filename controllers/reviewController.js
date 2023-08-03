const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures');
const factory = require('./handlerFactory');

///// HANDLERS /////
const createReviewHandler = async (req, res, next) => {
  // if no tour specified, pull it from the route (/api/v1/tours/:tourId/reviews)
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // if no user specified, pull it from the protect middleware
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
};

const getAllReviewsHandler = async (req, res, next) => {
  // check if this is a *specific* tour asking for its reviews
  let tourFilter = {};
  if (req.params.tourId) tourFilter = { tour: req.params.tourId };
  // build query
  const queryObj = { ...req.query };
  let query = Review.find(tourFilter);
  // apply filter/sort operations
  query = apiFeatures.filter(query, queryObj);
  query = apiFeatures.sort(query, queryObj);
  query = apiFeatures.project(query, queryObj);
  query = apiFeatures.paginate(query, queryObj);
  // execute query
  const reviews = await query;
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
};

const getReviewHandler = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { review },
  });
};

const patchReviewHandler = async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { review },
  });
};

exports.deleteReview = factory.deleteOne(Review, 'id');

///// LOAD AND EXPORT HANDLERS /////
exports.createReview = catchAsync(createReviewHandler);
exports.getAllReviews = catchAsync(getAllReviewsHandler);
exports.getReview = catchAsync(getReviewHandler);
exports.patchReview = catchAsync(patchReviewHandler);
