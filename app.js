const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

///// GLOBAL MIDDLEWARES /////
app.use(express.json());
app.use(express.static('./public'));
app.use(morgan('dev'));
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
