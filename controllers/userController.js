const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// HELPER FUNCTIONS /////
const filterObj = function (object, ...allowedFields) {
  const filteredObject = {};
  Object.keys(object).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObject[key] = object[key];
    }
  });
  return filteredObject;
};

///// HANDLERS /////
const getAllUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', data: { users: users } });
};

const getUser = async (req, res, next) => {
  res.status(500).json({ status: 'error', message: 'route not yet defined' });
};

exports.patchUser = factory.patchOne(User, 'id');

exports.deleteUser = factory.deleteOne(User, 'id');

const updateMe = async (req, res, next) => {
  // required FIELDS to update
  // sanitizes input so user can't update password or role
  // create error when user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route can not update password information', 400)
    );

  // sanitize inputs to only the ones that can be updated
  filteredBody = filterObj(req.body, 'userName', 'email');

  // update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    vunValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: {
      userName: updatedUser.userName,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
};

const deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

///// LOAD AND EXPORT HANDLERS /////
exports.getAllUsers = catchAsync(getAllUsers);
exports.getUser = catchAsync(getUser);
exports.updateMe = catchAsync(updateMe);
exports.deleteMe = catchAsync(deleteMe);
