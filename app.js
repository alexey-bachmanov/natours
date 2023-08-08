const express = require('express');
const path = require('path');

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
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

///// SETUP VIEWS /////
// express natively supports the most common view engines (incl. pug)
// set pug as the view engine:
app.set('view engine', 'pug');
// define directory where views are located:
app.set('views', path.join(__dirname, 'views'));
// serve up static files:
app.use(express.static(path.join(__dirname, 'public')));

///// GLOBAL MIDDLEWARES /////
// set security HTTP headers:
app.use(helmet());
// rate limit:
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this address',
});
app.use('/api', limiter);
// parse body data into req.body:
app.use(express.json({ limit: '10kb' }));
// sanitize data against NoSQL query injection and XSS (cross-site scripting) attacks:
app.use(mongoSanitize());
app.use(xssClean());
// prevent http parameter pollution:
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
// development logging:
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

///// ROUTES /////
// mount routers
// view routes:
app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'John',
  });
});
app.get('/overview', (req, res) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});
app.get('/tour', (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
});
// api routes:
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// catch unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Invalid route: ${req.originalUrl}`, 400));
});

// error handling middleware
app.use(globalErrorController);

module.exports = app;
