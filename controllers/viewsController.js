const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
  // handle no tour found
  if (!tour) return next(new AppError('Tour not found', 404));
  // render that template using tour data
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
};

const getLoginFormHandler = async (req, res, next) => {
  res.status(200).render('login', { title: 'Log in' });
};

const getAccountHandler = (req, res, next) => {
  res.status(200).render('account', { title: 'My account' });
};

// const updateUserDataHandler = async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//       userName: req.body.userName,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   res.status(200).render('account', { title: 'My account', user: updatedUser });
// };

const getMyToursHandler = async (req, res, next) => {
  // find all bookings associated with the user
  bookings = await Booking.find({ user: req.user.id });
  // pull the tour ID's from the returned bookings
  const tourIds = bookings.map((el) => el.tour);
  // find array of tours associated with those ID's
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
};

///// LOAD AND EXPORT HANDLERS /////
exports.getOverview = catchAsync(getOverviewHandler);
exports.getTour = catchAsync(getTourHandler);
exports.getLoginForm = catchAsync(getLoginFormHandler);
exports.getAccount = getAccountHandler;
// exports.updateUserData = catchAsync(updateUserDataHandler);
exports.getMyTours = catchAsync(getMyToursHandler);
