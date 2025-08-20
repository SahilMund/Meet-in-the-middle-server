import { sendVerificationEmail , sendWelComeMail} from "../utils/sendMail.util.js";
import OtpModel from "../models/otp.model.js";
import UserModel from "../models/user.model.js";

const sendOTP = async (req, res) => {
  try {
    const email = req.body.email; // Assuming the user's email is stored in req.email
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP

    const exists = await OtpModel.findOne({ email });
    console.log(exists, "OTP ALREADY EXIT");
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
      console.log({ otpData });
    }

    const result = await sendVerificationEmail(email, otp);
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
    console.log(otpData);
    if (!otpData) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 2. Check expiry
    const currentTime = new Date();
    const otpTime = otpData.createdAt;
    const timeDiff = (currentTime - otpTime) / 1000; // seconds
    if (timeDiff > 1000) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 3. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 4. Create user
    await UserModel.create({
      name,
      email,
      password,
    });

    // 5. Delete OTP after verification
    await OtpModel.deleteOne({ email });
    console.log("OTP deleted successfully");
    await sendWelComeMail(email);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP", error });
  }
};

export { sendOTP, verifyOTP };
