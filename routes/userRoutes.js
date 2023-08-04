const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

///// ROUTES /////
const router = express.Router();

// user creation (special, non-RESTful routes)
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

// 'forgot my password' routes
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// ↓ require authorization for everything below this point ↓
router.use(authController.protect);

// user updates by the user themselves
router.route('/me').get(userController.getMe, userController.getUser);
router.route('/updateMyPassword').patch(authController.updatePassword);
router.route('/updateMe').patch(userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

// ↓ require admin for everything below this point ↓
router.use(authController.restrictTo('admin'));

// user queries (RESTful)
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
