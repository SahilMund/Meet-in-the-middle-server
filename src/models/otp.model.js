import mongoose from "mongoose";

export const otpSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 600, // ⏱️ 600 seconds = 10 minutes--- TTL Index
    },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, otp: 1 }); // Fast OTP validation
otpSchema.index({ email: 1, createdAt: -1 }); // Fetch latest OTP if needed

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
