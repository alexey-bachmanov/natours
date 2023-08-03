const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // pull params from tourRouter on redirect

///// MIDDLEWARE /////
// router.param('id', reviewController.checkID);

///// ROUTES /////
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.patchReview)
  .delete(reviewController.deleteReview);

module.exports = router;
