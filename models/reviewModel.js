const mongoose = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('../utils/appError');

///// SCHEMA /////
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      max: [5, 'rating must be between 1 and 5'],
      min: [1, 'rating must be between 1 and 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

///// MIDDLEWARE /////
// populate user data on query
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'userName photo',
  });
  next();
});

reviewSchema.post('save', function () {
  // call calcAverageRatings and retrieve stats
  // this points to document
  // this.constructor points to document's Model
  // calcAverageRatings must be called on the model
  this.constructor.calcAverageRatings(this.tour);
});

// ↓ works for findByIdAndUpdate & findByIdAndDelete
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // this points to query, doc points to just found doc
  if (!doc) return next(new AppError('No document found for that ID', 404));
  await doc.constructor.calcAverageRatings(doc.tour);
  next();
});

///// STATIC METHODS /////
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // re-calculate number and average of all reviews
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating || 4.5,
    ratingsQuantity: stats[0].numRatings || 0,
  });
};

///// MODEL /////
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
