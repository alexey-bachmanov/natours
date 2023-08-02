const express = require('express');
const tourController = require('../controllers/tourController');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

///// MIDDLEWARE /////
router.param('tourId', tourController.checkID);
// router.use((req, res, next) => {
//   console.log(req.query, req.url);
//   next();
// });

///// ROUTES /////
// alias route
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// aggregate routes
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:tourId')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// simple nested route, DON'T do this
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
