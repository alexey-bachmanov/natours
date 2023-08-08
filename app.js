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
const viewRouter = require('./routes/viewRoutes');

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
// set security HTTP headers with helmet:
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
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
app.use('/', viewRouter);
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
