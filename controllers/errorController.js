const AppError = require('../utils/appError');

///// PROD/DEV ERROR HANDLING /////
const sendErrorDev = (err, res) => {
  // similar to sendErrorProd, just including error information
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
    });
  } else {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
      error: err,
    });
  }
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // error thrown with AppError, info should be forwarded
    // to the client (404s, DB errors, invalid routes, etc)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming errors, info should be logged to the
    // hosting platform and hidden from the user
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'internal server error',
    });
  }
};

///// SPECIFIC ERROR TYPE HANDLERS /////
const handleDBValidationError = (err) => {
  return new AppError(err.message, 400);
};
const handleDBDuplicateError = (err) => {
  const fieldVal = err.message.match(/(["])(\\?.)*?\1/)[0];
  const message = `Entry with value: ${fieldVal} already exists`;
  return new AppError(message, 400);
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
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    if (
      error._message === 'Tour validation failed' ||
      error._message === 'User validation failed'
    )
      error = handleDBValidationError(err);
    if (error.code === 11000) error = handleDBDuplicateError(err);
    if (error.name === 'JsonWebTokenError') error = handleJWTInvalid(err);
    if (error.name === 'TokenExpiredError') error = handleJWTExpired(err);
    sendErrorProd(error, res);
    // sendErrorDev(error, res);
  }
};
