///// SETUP ENVIRONMENT VARIABLES/////
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const PORT = process.env.PORT || 3000;

///// IMPORTS /////
const mongoose = require('mongoose');

///// HANDLE UNCAUGHT EXCEPTIONS /////
process.on('uncaughtException', (err) => {
  // log exception
  console.log('UNCAUGHT EXCEPTION:');
  console.log(err.name, err.message, err.stack);
  // shut down
  process.exit(1);
});

///// CONFIGS /////
const app = require('./app');

///// DB CONFIGS /////
const DB = process.env.MDB_URI.replace('<PASSWORD>', process.env.MDB_PWD);
mongoose.connect(DB).then(() => {
  if (process.env.NODE_ENV === 'development') console.log(`DB connected...`);
});

///// SERVER START /////
const server = app.listen(PORT, '127.0.0.1', () => {
  if (process.env.NODE_ENV === 'development')
    console.log(`listening on port ${PORT}...`);
});

// TODO: add api/v1/healthz route that always returns 200 (for production monitoring)
// TODO: set up sendgrid for emails
// TODO: set up stripe for payments
// TODO: ? implement password reset page
// TODO: ? implement signup page
