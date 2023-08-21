const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// HANDLERS /////
const getCheckoutSession = async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    // temporary solution until we get webhooks working
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    // product details
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://natours-alexey-bachmanov.onrender.com/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
  });

  // send session to client
  res.status(200).json({
    status: 'success',
    session: session,
  });
};

const createBookingCheckout = async (req, res, next) => {
  // temporary because unsecure, will be fixed with webhooks
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) return next(); // go to the views router
  // if you have tour, user, and price, create a booking
  await Booking.create({ tour, user, price });
  // and redirect to the home page without the query string
  res.redirect(`${req.protocol}://${req.get('host')}`);
};

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking, 'id');

exports.patchBooking = factory.patchOne(Booking, 'id');

exports.deleteBooking = factory.deleteOne(Booking, 'id');

///// LOAD AND EXPORT HANDLERS /////
exports.getCheckoutSession = catchAsync(getCheckoutSession);
exports.createBookingCheckout = catchAsync(createBookingCheckout);
