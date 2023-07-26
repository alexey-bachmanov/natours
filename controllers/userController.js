const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

///// HANDLERS /////
const getAllUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', data: { users: users } });
};
const createUser = (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};
const getUser = (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};
const patchUser = (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};
const deleteUser = (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};

///// LOAD AND EXPORT HANDLERS /////
exports.getAllUsers = catchAsync(getAllUsers);
exports.createUser = catchAsync(createUser);
exports.getUser = catchAsync(getUser);
exports.patchUser = catchAsync(patchUser);
exports.deleteUser = catchAsync(deleteUser);
