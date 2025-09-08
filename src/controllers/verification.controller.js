import crypto from "crypto";

import OtpModel from "../models/otp.model.js";
import UserModel from "../models/user.model.js";
import Preferences from "../models/preferences.model.js";
import {
  sendWelComeMail,
  sendVerificationEmail,
} from "../utils/sendMail.util.js";

const sendOTP = async (req, res) => {
  try {
    const email = req.body.email; // Assuming the user's email is stored in req.email
    // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    // Uses Math.random() → not cryptographically secure.
    // Predictable if someone brute-forces fast enough.

    const otp = crypto.randomInt(100000, 999999).toString();

    // const exists = await OtpModel.findOne({ email });
    // if (exists) {
    //   exists.createdAt = new Date();
    //   exists.otp = otp;
    //   await exists.save();
    // } else {
    //   const otpData = new OtpModel({
    //     email,
    //     otp,
    //   });
    //   await otpData.save();
    //   console.log(otpData);
    // }

    // Atomic upsert -- update+insert
    await OtpModel.findOneAndUpdate(
      { email }, // search by email
      { $set: { otp, createdAt: new Date() } }, // update if exists
      { upsert: true, new: true } // if not found → insert
    );

    await sendVerificationEmail(email, otp);

    res.status(201).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp, password, name } = req.body;

    // 1. Check OTP
    const otpData = await OtpModel.findOne({ email, otp });
    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 2. Check expiry
    const currentTime = new Date();
    const otpTime = otpData.createdAt;
    const timeDiff = (currentTime - otpTime) / 1000; // seconds
    if (timeDiff > 6000) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 3. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 4. Create user
    const user = await UserModel.create({
      name,
      email,
      password,
    });

    // 5. Delete OTP after verification
    await OtpModel.deleteOne({ email });

    const userSettingsNew = await Preferences.create({
      userId: user._id,
    });

    //creating user default settings
    // user.settings = userSettingsNew._id;
    // user.save().then();

    //avoid .save() here. Use findByIdAndUpdate since you don’t need schema hooks/middleware for this simple field assignment.
    await UserModel.findByIdAndUpdate(user._id, {
      settings: userSettingsNew._id,
    });

    // 7. Send welcome mail (async but not blocking response)
    sendWelComeMail(email).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP", error });
  }
};

export { sendOTP, verifyOTP };
