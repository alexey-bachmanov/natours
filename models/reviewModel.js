const mongoose = require('mongoose');

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

///// MODEL /////
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
