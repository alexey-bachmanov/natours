///// SETUP ENVIRONMENT VARIABLES/////
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

///// IMPORTS /////
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

///// MAIN FUNCTIONS /////
const readAndSaveToDB = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully read');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

///// DB CONNECT AND RUN CLI COMMANDS /////
const DB = process.env.MDB_URI.replace('<PASSWORD>', process.env.MDB_PWD);
mongoose.connect(DB).then(() => {
  console.log('DB connected...');
  if (process.argv[2] === '--import') readAndSaveToDB();
  if (process.argv[2] === '--delete') deleteAllData();
  if (process.argv[2] === '--reload') {
    deleteAllData();
    readAndSaveToDB();
  }
});
