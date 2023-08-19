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
  console.log(`DB connected...`);
});

///// SERVER START /////
if (process.env.NODE_ENV === 'development') {
  // run development server on localhost
  // usu 127.0.0.1:3000
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`listening on port ${PORT}...`);
  });
} else {
  // run production server on Render
  // usu 0.0.0.0:10000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on port ${PORT}...`);
  });
}
