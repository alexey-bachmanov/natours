const User = require('../models/userModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');

///// HELPER FUNCTIONS /////
const signToken = function (body) {
  return jwt.sign(body, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (user, statusCode, res) {
  const token = signToken({ id: user._id });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // days → milliseconds
    ),
    httpOnly: true, // seal so can't be accessed or modified by the browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // only send over HTTPS
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: {
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    },
  });
};

///// MIDDLEWARE /////
const protect = async (req, res, next) => {
  // get token / check if it exists
  let token;
  if (
    // if authorization is happening with a header
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // if authorization is happening with a cookie
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('Invalid authorization token', 401));

  // verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // check if user still exists
  const user = await User.findById(decoded.id).select('+password');
  if (!user) return next(new AppError('User no longer exists', 401));

  // check if user changed passwords after token was issued
  if (user.passwordChangedAfter(decoded.iat))
    return next(new AppError('Token invalid: password changed', 401));

  // grant acess to protected route
  req.user = user;
  next();
};

const isLoggedIn = async (req, res, next) => {
  // only exists to pull user from auth token,
  // for conditionally rendered elements on pages
  // get token / check if it exists
  let token;
  if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token) return next();

  // verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) return next();

  // check if user changed passwords after token was issued
  if (user.passwordChangedAfter(decoded.iat)) return next();

  // if you made it to this point, there is a valid logged-in user
  // put the user into res.locals (so pug can access it)
  res.locals.user = user;
  next();
};

const restrictTo = (...requiredRoles) => {
  // requiredRoles = ['user','admin']
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };
};

///// HANDLERS /////
const signup = async (req, res, next) => {
  // requires USERNAME, EMAIL, PASSWORD and PWDCONFIRM
  // creates a new user document with the role 'user'
  // sanitize inputs
  const newUser = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken({ id: newUser._id });
  createSendToken(newUser, 201, res);
};

const login = async (req, res, next) => {
  // requires EMAIL and PASSWORD
  // sends LOGIN TOKEN
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;

  // check if email and password were sent
  if (!enteredEmail || !enteredPassword)
    return next(new AppError('Need both email and password', 400));

  // check if user exists and password is correct
  const user = await User.findOne({ email: enteredEmail }).select('+password');
  if (!user || !(await user.passwordMatch(enteredPassword, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // if everything is ok, send token to client
  createSendToken(user, 200, res);
};

const logout = async (req, res, next) => {
  // send an empty cookie that will expire quickly to replace our login cookie
  const cookieOptions = {
    expires: new Date(Date.now() - 1000), // expires 1s in the past
    httpOnly: true, // seal so can't be accessed or modified by the browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // only send over HTTPS
  res.cookie('jwt', '', cookieOptions);
  res.status(200).json({
    status: 'success',
  });
};

const forgotPassword = async (req, res, next) => {
  // requires EMAIL
  // sends RESET TOKEN to user's email
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No users with that email address', 404));

  // generate reset token and save token hash to DB
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Natours password reset (valid for 10min)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'reset token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email', 500));
  }
};

const resetPassword = async (req, res, next) => {
  // requires RESET TOKEN and NEW PASSWORD
  // resets user's password
  // returns LOGIN TOKEN
  // get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if there is a user, and token isn't expired, set password
  if (!user) return next(new AppError('Invalid or expired reset token', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in (send JWT)
  createSendToken(user, 200, res);
};

const updatePassword = async (req, res, next) => {
  // requires LOGIN TOKEN, CURRENT PWD, NEW PWD and PWDCONFIRM
  // updates user's password
  // retrieve user from collection (done in protect middleware)
  const user = req.user;
  // check if posted password is correct
  if (!req.body.password)
    return next(new AppError('Please provide current password', 401));
  if (!req.body.passwordNew || !req.body.passwordConfirm)
    return next(
      new AppError('Please provide new password and passwordConfirm', 400)
    );
  if (!(await req.user.passwordMatch(req.body.password, user.password)))
    return next(new AppError('Invalid password', 401));

  // if correct, update password
  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // log user in
  createSendToken(user, 200, res);
};

///// LOAD AND EXPORT HANDLERS /////
exports.signup = catchAsync(signup);
exports.login = catchAsync(login);
exports.logout = catchAsync(logout);
exports.protect = catchAsync(protect);
exports.restrictTo = restrictTo;
exports.forgotPassword = catchAsync(forgotPassword);
exports.resetPassword = catchAsync(resetPassword);
exports.updatePassword = catchAsync(updatePassword);
exports.isLoggedIn = isLoggedIn;
