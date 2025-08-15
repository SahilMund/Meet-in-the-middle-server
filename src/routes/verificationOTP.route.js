import express from "express";
import { sendOTP, verifyOTP } from "../controllers/verification.controller.js";
const router = express.Router();

// use this for sign up and to verify user email
// send OTP to user's email
// verify OTP sent to user's email
// This is used for user registration and email verification
// It sends an OTP to the user's email and verifies it

router.post('/sendOtp',sendOTP);
router.post('/verifyOtp', verifyOTP);
export default router;

