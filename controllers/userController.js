const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

///// MULTER CONFIGURATION /////
// set up storage
// save directly to disk:
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // store as user-{userID}-{timestamp}.jpeg
//     const ext = file.mimetype.split('/')[1]; // 'img/jpeg' → 'jpeg'
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
// save to memory buffer:
const multerStorage = multer.memoryStorage();

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
// upload.single('field') for single images
// upload.array('field', 3) for an array of 3
// upload.fields([{name: 'field1', maxCount: 3}, {name: 'field2', maxCount: 4}])
// for multiple fields
const uploadUserPhoto = upload.single('photo');

// resizeUserPhoto crops and scales incoming photos so they're a
// square aspect ratio and a reasonable size.
const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  // store as user-{userID}-{timestamp}.jpeg
  // set file.filename so updateMe has access to it
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;
  // resize / compress / convert image and save it to public/img/users/...
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

///// HANDLERS /////
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, 'id');
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
  // if an image was uploaded with multer, add that path to our filter
  if (req.file) filteredBody.photo = req.file.filename;

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
      photo: updatedUser.photo,
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
exports.resizeUserPhoto = catchAsync(resizeUserPhoto);
exports.updateMe = catchAsync(updateMe);
exports.deleteMe = catchAsync(deleteMe);
