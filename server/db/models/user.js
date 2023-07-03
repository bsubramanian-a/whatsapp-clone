const { Schema, model } = require('mongoose');
const uniqueId = require('../../helpers/uniqueId');

const UserSchema = new Schema(
  {
    username: {
      type: Schema.Types.String,
      unique: false,
      trim: true,
      required: false,
      minLength: 3,
      maxLength: 24,
    },
    email: {
      type: Schema.Types.String,
      unique: false,
      required: false,
    },
    password: {
      type: Schema.Types.String,
      required: false,
    },
    qrCode: {
      type: Schema.Types.String,
      required: false,
      default: uniqueId(16, { lowercase: false }),
    },
    verified: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    isLoggedIn: {
      type: Schema.Types.Boolean,
      required: true,
      default: false,
    },
    otp: {
      type: Schema.Types.Number,
    },
    phoneNumber: {
      type: Schema.Types.String,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = model('users', UserSchema);
