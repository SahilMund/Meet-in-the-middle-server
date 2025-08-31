import OtpModel from "../models/otp.model.js";
import UserModel from "../models/user.model.js";
import userSettings from "../models/userSettings.mode.js";
import {
  sendWelComeMail,
  sendVerificationEmail,
} from "../utils/sendMail.util.js";

const sendOTP = async (req, res) => {
  try {
    const email = req.body.email; // Assuming the user's email is stored in req.email
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    const exists = await OtpModel.findOne({ email });
    if (exists) {
      exists.createdAt = new Date();
      exists.otp = otp;
      await exists.save();
    } else {
      const otpData = new OtpModel({
        email,
        otp,
      });
      await otpData.save();
      console.log(otpData);
    }

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

    await sendWelComeMail(email);
    const userSettingsNew = await userSettings.create({
      userId: user._id,
    }); //creating user default settings
    user.settings = userSettingsNew._id;
    user.save().then();
    res.status(200).json({ message: "OTP verified successfully" });
    // res.status(200).json(userSettings);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP", error });
  }
};

export { sendOTP, verifyOTP };
