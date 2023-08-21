const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// ↓ require authorization for everything below here ↓
router.use(authController.protect);

// create client-side checkout session
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

// CRUD operations
router
  .route('/')
  .get(
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.getAllBookings
  )
  .post(authController.restrictTo('admin'), bookingController.createBooking);

router
  .route('/:id')
  .get(
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.getBooking
  )
  .patch(authController.restrictTo('admin'), bookingController.patchBooking)
  .delete(authController.restrictTo('admin'), bookingController.deleteBooking);

module.exports = router;
