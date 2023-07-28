const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('./utils/xssCleaner');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

///// GLOBAL MIDDLEWARES /////
// set security HTTP headers
app.use(helmet());
// rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this address',
});
app.use('/api', limiter);
// parse body data into req.body
app.use(express.json({ limit: '10kb' }));
// sanitize data against NoSQL query injection and XSS (cross-site scripting) attacks
app.use(mongoSanitize());
app.use(xssClean());
// prevent http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'maxGroupSize',
      'price',
    ],
  })
);
// serve up static files
app.use(express.static('./public'));
// development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

///// ROUTES /////
// mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// catch unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Invalid route: ${req.originalUrl}`, 400));
});

// error handling middleware
app.use(globalErrorController);

module.exports = app;
