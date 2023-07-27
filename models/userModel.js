const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

///// SCHEMA /////
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'User name is required'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Valid email is required',
    },
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'tour-guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    // make sure it never shows up in queries
    select: false,
  },
  passwordConfirm: {
    // only included for password confirmation, deleted in middleware
    // required INPUT, but not required to actually be in the database
    type: String,
    required: [true, 'Password is required'],
    validate: {
      // only works on .create and .save
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

///// MIDDLEWARE /////
// password encryption
userSchema.pre('save', async function (next) {
  // if password wasn't modified, skip this function
  if (!this.isModified('password')) return next();
  // store only hashed password, and delete passwordConfirm
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000; // hack to make simultaneously created JWTs valid
  next();
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.passwordChangedAt = Date.now();
//   next();
// });

userSchema.pre(/^find/, function (next) {
  // this is query middleware, so 'this' points to the current query object
  this.find({ active: { $ne: false } });
  next();
});

///// INSTANCE METHODS /////
userSchema.methods.passwordMatch = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTIssuedAt) {
  return new Date(this.passwordChangedAt) > new Date(JWTIssuedAt * 1000);
};

userSchema.methods.createPasswordResetToken = function () {
  // create long, random hexadecimal string for a token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // store the token's hash in the DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // return the plaintext token
  return resetToken;
};

///// MODEL /////
const User = mongoose.model('User', userSchema);

module.exports = User;
