const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// MULTER SETUP /////
// set up storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // store as user-{userID}-{timestamp}.jpeg
    const ext = file.mimetype.split('/')[1]; // 'img/jpeg' → 'jpeg'
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

// set up multer filter
// is the uploaded file an image? if so pass true into cb()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(true);
  } else {
    cb(new AppError('Not an image. Please only upload images.', 400), false);
  }
};

// configure image upload with multer - set up directory where
// file uploads will be saved
const upload = multer({
  dest: 'public/img/users',
  storage: multerStorage,
  filter: multerFilter,
});

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

///// MIDDLEWARE /////
const getMe = (req, res, next) => {
  // hack-y middleware allowing the /me endpoint to work
  req.params.id = req.user.id;
  next();
};

// upload.single processes image uploads. it parses incoming formdata
// with included images, and attatches info to req.file
const uploadUserPhoto = upload.single('photo');

///// HANDLERS /////
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, 'id');
exports.patchUser = factory.patchOne(User, 'id');
exports.deleteUser = factory.deleteOne(User, 'id');

const updateMe = async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
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
exports.getMe = getMe;
exports.uploadUserPhoto = uploadUserPhoto;
exports.updateMe = catchAsync(updateMe);
exports.deleteMe = catchAsync(deleteMe);
