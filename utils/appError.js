class AppError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // cuts *this particular method* out of the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
