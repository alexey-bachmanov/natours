const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

///// ROUTES /////
const router = express.Router();

// user creation (special, non-RESTful route)
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

// user queries (RESTful)
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
