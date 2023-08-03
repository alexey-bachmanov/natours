const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

///// HANDLER FACTORIES /////
exports.deleteOne = (Model, idPath) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params[idPath]);
    if (!doc) return next(new AppError('No document found for that ID', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.createOne = (Model) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newDoc,
    });
  });
};

exports.patchOne = (Model, idPath) => {
  // immediately return a handler function, wrapped in catchAsync
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params[idPath], req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found for that ID', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
};
