import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import crypto from "crypto";
import { sendResetPasswordMail } from "../utils/sendMail.util.js";

import { generateToken, generateRefreshToken } from "../utils/jwt.util.js";

const router = express.Router();

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const accessToken = generateToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     res.json({
//       message: "Login successful",
//       accessToken,
//       refreshToken,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });
// import jwt from "jsonwebtoken";


// router.post("/refreshAccessToken", async (req, res) => {
//   try {
//     // You can send refresh token via headers or cookies
//     const { refreshToken } = req.body; // or req.cookies.refreshToken

//     if (!refreshToken) {
//       return res.status(401).json({ message: "No refresh token provided" });
//     }

//     // Verify refresh token
//     jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
//       if (err) {
//         return res.status(401).json({ message: "Invalid refresh token" });
//       }

//       // Generate a new access token
//       const newAccessToken = jwt.sign(
//         { id: decoded.id },
//         process.env.JWT_SECRET,
//         { expiresIn: "15m" }
//       );

//       res.json({ accessToken: newAccessToken });
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
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
    await sendResetPasswordMail(email, resetLink);

    res.json({ message: "Reset password link sent to your email" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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
     user.password = password
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
