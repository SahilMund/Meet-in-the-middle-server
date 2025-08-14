import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || (await user.comparePassword(password))) {
      return sendResponse(res, "Invalid credentials", 401);
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    const options = {
      httpOnly: true,
      // secure: true,//uncomment before deployment
    };
    res.status(200).cookie("token", token, options).json({
      message: "User logged in Successfully",
      data: { user, token },
      success: true,
    });
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};
