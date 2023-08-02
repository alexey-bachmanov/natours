const mongoose = require('mongoose');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const apiFeatures = require('../utils/apiFeatures');

///// MIDDLEWARE FUNCTIONS /////
exports.checkID = async (req, res, next) => {
  try {
    // is the ID valid ?
    if (!mongoose.isObjectIdOrHexString(req.params.id))
      // call next() with an error in the args, so code skips to global error
      // handling middleware in app.js
      return next(new AppError('No review found for that ID', 404));

    // does a valid tour exist with that ID?
    const reviewExists = await Review.exists({ _id: req.params.id });
    if (!reviewExists)
      return next(new AppError('No review found for that ID', 404));
  } catch (error) {
    next(error);
  }
  next();
};

///// HANDLERS /////
const createReviewHandler = async (req, res, next) => {
  // sanitize inputs
  if (req.body._id) delete req.body._id;
  if (req.body.id) delete req.body.id;
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
};

const getAllReviewsHandler = async (req, res, next) => {
  // build query
  const queryObj = { ...req.query };
  let query = Review.find();
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

const deleteReviewHandler = async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

///// LOAD AND EXPORT HANDLERS /////
exports.createReview = catchAsync(createReviewHandler);
exports.getAllReviews = catchAsync(getAllReviewsHandler);
exports.getReview = catchAsync(getReviewHandler);
exports.patchReview = catchAsync(patchReviewHandler);
exports.deleteReview = catchAsync(deleteReviewHandler);
