import express from "express";

import { sendOTP, verifyOTP } from "../controllers/verification.controller.js";
const router = express.Router();

// use this for sign up and to verify user email
// send OTP to user's email
// verify OTP sent to user's email
// This is used for user registration and email verification
// It sends an OTP to the user's email and verifies it
/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user's email
 *     description: Generates a 6-digit OTP and sends it to the provided email. OTP expires in 10 minutes.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *       500:
 *         description: Failed to send OTP
 *
 */

router.post("/sendOtp", sendOTP);

// This is used to verify the OTP sent to the user's email
// It checks if the OTP is valid and marks the user as verified
// If the OTP is valid, *it creates the user's profile* and returns a success response
// If the OTP is invalid, it returns an error

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and register user
 *     description: Verifies OTP and creates a new user if valid. Deletes OTP entry after verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 example: "strongPassword123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: OTP verified and user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *       400:
 *         description: Invalid OTP or user already exists
 *       500:
 *         description: Failed to verify OTP
 * */
router.post("/verifyOtp", verifyOTP);
export default router;
