import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendResetPasswordMail } from "../utils/sendMail.util.js";
import sendResponse from "../utils/response.util.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = express.Router();

router.post("/forgot-password",isLoggedIn, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 1000 * 60 * 15; // 15 min expiry
    await user.save();
    
    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log({email, resetLink})
    await sendResetPasswordMail(email, resetLink);
    sendResponse(res,"Reset password link sent to your email",200)
    console.log("after")
    
    // res.json({ message:  });
  } catch (error) {
    sendResponse(res,"Something went wrong",400)
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // const salt = await bcrypt.genSalt(10); // 10 is standard
    // user.password = await bcrypt.hash(password, salt);
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

export default router;
