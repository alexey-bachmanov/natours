const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

///// ROUTES /////
const router = express.Router();

// user creation (special, non-RESTful routes)
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

// user updates by the user themselves
router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);
router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

// 'forgot my password' routes
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// user queries (RESTful)
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
