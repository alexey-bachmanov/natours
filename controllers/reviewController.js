const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

///// MIDDLEWARE /////
exports.setTourAndUserIds = (req, res, next) => {
  // if no tour specified, pull it from the route (/api/v1/tours/:tourId/reviews)
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // if no user specified, pull it from the protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

///// HANDLERS /////
exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review, 'id');
exports.patchReview = factory.patchOne(Review, 'id');
exports.deleteReview = factory.deleteOne(Review, 'id');
