///// SETUP ENVIRONMENT VARIABLES/////
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

///// IMPORTS /////
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));

///// MAIN FUNCTIONS /////
const readAndSaveToDB = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully read');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
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
});
