const mongoose = require('mongoose');
const slugify = require('slugify');

///// SCHEMA /////
const tourSchema = new mongoose.Schema(
  {
    // startLocation: {
    //   description: 'Miami, USA',
    //   type: 'Point',
    //   coordinates: [-80.185942, 25.774772],
    //   address: '301 Biscayne Blvd, Miami, FL 33132, USA',
    // },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'rating must be between 1 and 5'],
      min: [1, 'rating must be between 1 and 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    images: [String],
    startDates: [Date],
    name: {
      type: String,
      required: [true, 'tour must have name'],
      unique: true,
      trim: true,
      maxLength: [40, 'tour name must have less than 40 characters'],
      minLength: [8, 'tour name must have more than 8 characters'],
      validate: {
        validator: function (name) {
          return !name.match(/[^A-Za-z0-9\s]/g);
        },
        message: 'name must only be alphanumeric characters',
      },
    },
    slug: { type: String, unique: true },
    duration: { type: Number, required: [true, 'tour must have duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy, medium, or difficult',
      },
    },
    // guides: ['5c8a22c62f8fb814b56fa18b', '5c8a1f4e2f8fb814b56fa185'],
    price: {
      type: Number,
      required: [true, 'tour must have price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount must be less than regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'tour must have summary'],
      trim: true,
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'tour must have cover image'],
      trim: true,
    },
    createdAt: { type: Date, default: Date.now(), select: false }, // select: never exposes this field
    // locations: [],
    secretTour: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
///// VIRTUAL PROPERTIES /////
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

///// MIDDLEWARE /////
// Save middleware
// AKA pre-save hook
// runs before .save() and .create() (not .findByIdAndUpdate() etc.)
// creates a slug
tourSchema.pre('save', function (next) {
  // this points to current document
  this.slug = slugify(this.name, { lower: true });
  next();
});
// AKA post-save hook
// tourSchema.post('save', function (doc, next) {
//   // doc points to just-saved doc
//   console.log(doc.slug);
//   next();
// });

// Query middleware
// tourSchema.pre('find', function (next) { // only works for .find()
tourSchema.pre(/^find/, function (next) {
  // works for .find(), .findByID(), etc.
  // this points to query
  // filters out any tour with secretTour = true
  this.find({ secretTour: false });
  next();
});
// tourSchema.post(/^find/, function (docs, next){
//   // docs points to found documents array
//   next()
// })

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: false } });
  next();
});

///// MODEL /////
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
