const AppError = require('../utils/appError');

///// PROD/DEV ERROR HANDLING /////
const sendErrorDev = (originalError, appError, res) => {
  // similar to sendErrorProd, just including error information
  if (appError.isOperational) {
    res.status(appError.statusCode).json({
      status: appError.status,
      message: appError.message,
      error: originalError,
    });
  } else {
    console.error(originalError);
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
    });
  }
};
const sendErrorProd = (originalError, appError, res) => {
  if (appError.isOperational) {
    res.status(appError.statusCode).json({
      status: appError.status,
      message: appError.message,
    });
  } else {
    console.error(originalError);
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
    });
  }
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

  if (err.name === 'JsonWebTokenError') error = handleJWTInvalid(err);
  if (err.name === 'TokenExpiredError') error = handleJWTExpired(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, error, res);
  } else {
    sendErrorProd(err, error, res);
  }
};
