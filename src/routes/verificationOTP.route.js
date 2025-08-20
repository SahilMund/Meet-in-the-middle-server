import express from 'express';

import { sendOTP, verifyOTP } from '../controllers/verification.controller.js';
const router = express.Router();

// use this for sign up and to verify user email
// send OTP to user's email
// verify OTP sent to user's email
// This is used for user registration and email verification
// It sends an OTP to the user's email and verifies it

router.post('/sendOtp', sendOTP);
// This is used to verify the OTP sent to the user's email
// It checks if the OTP is valid and marks the user as verified
// If the OTP is valid, *it creates the user's profile* and returns a success response
// If the OTP is invalid, it returns an error
router.post('/verifyOtp', verifyOTP);
export default router;
