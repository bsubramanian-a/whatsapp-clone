const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const mongoose = require('mongoose');
const UserModel = require('../db/models/user');
const ProfileModel = require('../db/models/profile');
const SettingModel = require('../db/models/setting');
const GroupModel = require('../db/models/group');
const ContactModel = require('../db/models/contact');

const response = require('../helpers/response');
const mailer = require('../helpers/mailer');

const encrypt = require('../helpers/encrypt');
const decrypt = require('../helpers/decrypt');
const { fail } = require('assert');

const sendMessage = async (body, phoneNumber, successMessage, failedMessage, payload, statusCode = 200, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC9cc237eb9d4e9481306592e396970535';
  const authToken = process.env.TWILIO_AUTH_TOKEN || 'fdbad51ebfccb3cc2bc3f1740748482b';
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER || '+525565280223',
      to: '+' + phoneNumber
    });

    res.status(statusCode).json({
      statusCode,
      message: successMessage,
      payload,
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: failedMessage });
  }
};

exports.logout = async (req, res) => {
  const userId = req?.user?._id;

  await UserModel.findOneAndUpdate(
    { _id: userId },
    { $set: { isLoggedIn: false } }
  );

  response({
    res,
    message: 'Successfully logged out!',
    success: true
  });
}

exports.register = async (req, res) => {
  try {
    // generate otp code
    const otp = Math.floor(1000 + Math.random() * 9000);
    const { phoneNumber } = req.body;

    const existingUser = await UserModel.findOne({ phoneNumber });

    if (existingUser) {
      if (existingUser.isLoggedIn) {
        sendMessage(
          `Someone is trying to login to your account, please confirm`,
          phoneNumber,
          'Please logout from the device already logged in.',
          'Please logout from the device already logged in.',
          { userId: null },
          403,
          res
        );
      } else {
        // Phone number already exists, update the OTP for the existing user
        existingUser.otp = otp;
        await existingUser.save();
        const userId = existingUser._id.toString();

        sendMessage(
          `Your verification code is: ${otp}`,
          phoneNumber,
          'Verification code sent successfully',
          'Failed to send verification code',
          { userId },
          200,
          res
        );
      }
    } else {
      // Phone number does not exist, create a new user with the given OTP
      const newUser = await new UserModel({ phoneNumber, otp }).save();
      const userId = newUser._id.toString();  
      // account setting
      await new SettingModel({ userId }).save();

      sendMessage(
        `Your verification code is: ${otp}`,
        phoneNumber,
        'Verification code sent successfully',
        'Failed to send verification code',
        { userId },
        200,
        res
      );
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    console.log("verify", userId, otp);

    // find the user by _id and OTP.
    // if the user is found, update the verified and OTP fields
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, otp },
      { $set: { verified: true, otp: null, isLoggedIn: true } }
    );

    // if the user not found
    if (!user) {
      // send a response as an OTP validation error
      const errData = {
        message: 'Invalid OTP code',
        statusCode: 401,
      };
      throw errData;
    }

    const token = jwt.sign({ _id: userId }, 'shhhhh');

    response({
      res,
      message: 'Successfully verified an account',
      payload: {
        user, token
      },
      success: true
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errData = {};
    const { username, password } = req.body;

    const user = await UserModel.findOne({
      $or: [
        { email: username }, // -> username field can be filled with email
        { username },
      ],
    });

    // if user not found or invalid password
    if (!user) {
      errData.statusCode = 401;
      errData.message = 'Username or email not registered';

      throw errData;
    }

    // decrypt password
    decrypt(password, user.password);
    // generate access token
    const token = jwt.sign({ _id: user._id }, 'shhhhh');

    response({
      res,
      statusCode: 200,
      message: 'Successfully logged in',
      payload: token, // -> send token to store in localStorage
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};

exports.find = async (req, res) => {
  try {
    // find user & exclude password
    const user = await UserModel.findOne(
      { _id: req.user._id },
      { password: 0 }
    );
    response({
      res,
      payload: user,
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findOne({ _id: userId });
    const compare = decrypt(req.body.password, user.password);

    if (!compare) {
      const errData = {
        message: 'Invalid password',
        statusCode: 401,
      };
      throw errData;
    }

    // delete permanently user, profile, setting, and contact
    await UserModel.deleteOne({ _id: userId });
    await ProfileModel.deleteOne({ userId });
    await SettingModel.deleteOne({ userId });
    await ContactModel.deleteMany({ userId });

    await GroupModel.updateMany(
      { participantsId: userId },
      { $pull: { participantsId: userId } }
    );

    response({
      res,
      message: 'Account deleted successfully',
      payload: user,
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};

exports.changePass = async (req, res) => {
  try {
    const errData = {};
    const userId = req.user._id;
    const { oldPass, newPass, confirmNewPass } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    // compare password
    if (!decrypt(oldPass, user.password)) {
      errData.statusCode = 401;
      errData.message = 'Invalid password';

      throw errData;
    }

    if (newPass !== confirmNewPass) {
      errData.statusCode = 400;
      errData.message = "New password doesn't match";

      throw errData;
    }

    // change password
    await UserModel.updateOne(
      { _id: userId },
      { $set: { password: encrypt(newPass) } }
    );

    // exclude password field when sending user data to client
    delete user.password;
    response({
      res,
      message: 'Password changed successfully',
      payload: user,
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};
