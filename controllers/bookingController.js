const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// HELPER FUNCTIONS /////
const createBooking = async (session) => {
  // tour id passed in durning getCheckoutSession call
  const tour = session.client_reference_id;
  // find user id by searching for a matching email
  const user = (await User.findOne({ email: session.customer_email })).id;
  // find price in the session info
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

///// HANDLERS /////
const getCheckoutSession = async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    // on success, redirect to my-tours and pass along infor to show in alert
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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

const webhookCheckoutHandler = async (req, res, next) => {
  // this is route is called by stripe on a successful payment
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    // create an event using the session data in req.body
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    // create booking in our database
    await createBooking(event.data.object);
  }

  res.status(200).json({ recieved: true });
};

exports.createBooking = factory.createOne(Booking);

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking, 'id');

exports.patchBooking = factory.patchOne(Booking, 'id');

exports.deleteBooking = factory.deleteOne(Booking, 'id');

///// LOAD AND EXPORT HANDLERS /////
exports.getCheckoutSession = catchAsync(getCheckoutSession);
// exports.createBookingCheckout = catchAsync(createBookingCheckout);
exports.webhookCheckout = catchAsync(webhookCheckoutHandler);
