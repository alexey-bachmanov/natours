const AppError = require('../utils/appError');

///// RENDER / JSON ERROR RESPONSE /////
const sendErrorJson = (appError, res) => {
  // send a json with some general information, but no internal server data
  res.status(appError.statusCode).json({
    status: appError.status,
    message: appError.message,
  });
};

const sendErrorPage = (appError, res) => {
  res.status(appError.statusCode).render('error', { error: appError });
};

///// SPECIFIC ERROR TYPE HANDLERS /////
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDBValidationError = (err) => {
  return new AppError(err.message, 400);
};
const handleDBDuplicateError = (err) => {
  const fieldVal = err.message.match(/(["])(\\?.)*?\1/)[0];
  const message = `Entry with value: ${fieldVal} already exists`;
  return new AppError(message, 400);
};
const handleDuplicateReviewError = (err) => {
  return new AppError("User can't review a tour more than once", 400);
};
const handleJWTInvalid = (err) => {
  return new AppError('Invalid login credentials', 401);
};
const handleJWTExpired = (err) => {
  return new AppError('Login credentials expired', 401);
};

///// EXPORTS /////
module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'internal server error';
  error.message = err.message;

  // call specific error type handlers:

  // incorrect ObjectId
  if (error.kind === 'ObjectId') error = handleCastErrorDB(err);

  // validation failure
  if (error._message && error._message.includes('validation failed'))
    error = handleDBValidationError(err);

  // duplicate reviews on the same tour by one user
  if (
    err.code === 11000 &&
    err.keyPattern.tour === 1 &&
    err.keyPattern.user === 1
  )
    error = handleDuplicateReviewError(err);

  // duplicate unique entries
  if (
    err.code === 11000 &&
    err.keyPattern.tour !== 1 &&
    err.keyPattern.user !== 1
  )
    error = handleDBDuplicateError(err);

  // JSON web token errors
  if (err.name === 'JsonWebTokenError') error = handleJWTInvalid(err);
  if (err.name === 'TokenExpiredError') error = handleJWTExpired(err);

  // figure out what kind of response to send:

  if (error.isOperational && req.originalUrl.startsWith('/api')) {
    // send an operational error json
    sendErrorJson(error, res);
  }
  if (!error.isOperational && req.originalUrl.startsWith('/api')) {
    // send a programming error json, & log error to server console
    console.error(err);
    sendErrorJson(error, res);
  }
  if (error.isOperational && !req.originalUrl.startsWith('/api')) {
    // send a rendered 404 page
    sendErrorPage(error, res);
  }
  if (!error.isOperational && !req.originalUrl.startsWith('/api')) {
    // send a rendered 500 page, & log error to server console
    console.error(err);
    sendErrorPage(error, res);
  }
};
