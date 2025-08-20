import mongoose from 'mongoose';
export const otpSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 600, // ⏱️ 600 seconds = 10 minutes
    },
  },
  { timestamps: true }
);
const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
