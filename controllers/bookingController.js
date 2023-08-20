const Tour = require('../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');

///// HANDLERS /////
const getCheckoutSession = async (req, res, next) => {
  // get currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    success_url: `${req.protocol}://${req.get('host')}/`,
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

///// LOAD AND EXPORT HANDLERS /////
exports.getCheckoutSession = catchAsync(getCheckoutSession);
