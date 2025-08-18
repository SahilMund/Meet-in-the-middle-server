import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import sendResponse from '../utils/response.util.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || (await user.comparePassword(password))) {
      return sendResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    const options = {
      httpOnly: true,
      // secure: true, //uncomment before deployment
    };

    res.cookie('token', token, options);

    return sendResponse(res, 'User logged in Successfully', 200, {
      user,
      token,
    });
  } catch (error) {
    sendResponse(res, 'Something went wrong', 500);
  }
};

export const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      // secure: true, //uncomment before deployment
    };
    res.cookie('token', '', options);

    return sendResponse(res, 'User logged out successfully', 200);
  } catch (error) {
    sendResponse(res, 'Something went wrong', 500);
  }
};

export const loggedInUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req?.user?.id });
    sendResponse(res, 'logged in user info', 200, {
      user,
    });
  } catch (error) {
    sendResponse(res, 'user not found', 400);
  }
};
