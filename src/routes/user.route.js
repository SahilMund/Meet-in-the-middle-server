import dotenv from "dotenv";
import express from "express";
import passport from "passport";

import { upload } from "../configs/multer.js";
import {
  getUserInfo,
  login,
  logout,
  uploadToDiskStorage,
  deleteUserAvatar,
  updateCurrentUser,
  getUserSettings,
  updateUserSettings,
  deleteUser,
  refreshAccessToken,
  sendMagicLink,
  verifyMagicLink,
} from "../controllers/user.controller.js";

import { oauthCallback } from "../controllers/oauth.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import jwt from "jsonwebtoken";
dotenv.config({ quiet: true });

const router = express.Router();
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               rememberMe:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only cookies containing JWT and refresh token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

router.post("/login", login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successful logout
 */
router.post("/logout", isLoggedIn, logout);

router.get("/test-error", (req, res) => {
  throw new Error("Forced crash");
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns information about the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User information retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         avatar:
 *                           type: string
 *                           format: uri
 *                           example: "https://example.com/avatar.jpg"
 *                         role:
 *                           type: string
 *                           example: "user"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */

router.get("/currUserInfo", isLoggedIn, getUserInfo);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Uploads a user avatar image, resizes it, stores in Cloudinary, and updates user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                     public_id:
 *                       type: string
 *                     width:
 *                       type: number
 *                     height:
 *                       type: number
 *                     format:
 *                       type: string
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post("/uploadAvatar", isLoggedIn, upload.single("image"), uploadToDiskStorage);

/**
 * @swagger
 * /deleteAvatar:
 *   post:
 *     summary: Delete user avatar
 *     description: Deletes the current avatar of the authenticated user.
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 */
router.post("/deleteAvatar", isLoggedIn, deleteUserAvatar);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user information
 *     description: Update the authenticated user's profile information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 pattern: "^[+]?[0-9]{10,15}$"
 *                 example: "+1234567890"
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 example: "New York, USA"
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Software developer passionate about open source."
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/updateUserInfo", isLoggedIn, updateCurrentUser);

/**
 * @swagger
 * /api/users/settings:
 *   get:
 *     summary: Get user preferences/settings
 *     description: Retrieve the current user's preferences and settings
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User settings fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Preferences'
 *       404:
 *         description: User settings not found
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     Preferences:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         emailNotifications:
 *           type: boolean
 *           example: true
 *         pushNotifications:
 *           type: boolean
 *           example: false
 *         language:
 *           type: string
 *           example: "en"
 *         theme:
 *           type: string
 *           example: "dark"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.get("/getUserSettings", isLoggedIn, getUserSettings);

/**
 * @swagger
 * /api/users/settings:
 *   patch:
 *     summary: Update user preferences/settings
 *     description: Update the current user's preferences and settings
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *                 example: true
 *               pushNotifications:
 *                 type: boolean
 *                 example: false
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de]
 *                 example: "en"
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 example: "dark"
 *               emailFrequency:
 *                 type: string
 *                 enum: [immediate, daily, weekly]
 *                 example: "daily"
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Preferences'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/putUserSettings", isLoggedIn, updateUserSettings);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: Schedule user account for deletion
 *     description: Marks user account for deletion (soft delete) and schedules permanent deletion after 30 days
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       202:
 *         description: User scheduled for deletion successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     scheduledDeletionDate:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put("/deleteUser", isLoggedIn, deleteUser);

/**
 * @swagger
 * /google:
 *   get:
 *     summary: Google login
 *     description: Redirects user to Google authentication.
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.events"],
    accessType: "offline", // 👈 tells Google to send refresh_token
    prompt: "consent", // 👈 force consent screen every time
  }),
);

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Google callback
 *     description: Handles Google authentication callback and returns JWT.
 */
router.get("/google/callback", passport.authenticate("google", { session: false }), oauthCallback);

/**
 * @swagger
 * /facebook:
 *   get:
 *     summary: Facebook login
 *     description: Redirects user to Facebook authentication.
 */
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }), // request email explicitly
);

/**
 * @swagger
 * /facebook/callback:
 *   get:
 *     summary: Facebook callback
 *     description: Handles Facebook authentication callback and returns JWT.
 */

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  oauthCallback,
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh access token using a valid refresh token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       403:
 *         description: User not found or inactive
 *       500:
 *         description: Internal server error
 */
router.post("/refreshAccessToken", refreshAccessToken);

/**
 * @swagger
 * /api/auth/magic-link:
 *   post:
 *     summary: Send magic login link
 *     description: Send a magic login link to the user's email address
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
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Magic link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */

router.post("/sendMagicLink", sendMagicLink);

/**
 * @swagger
 * /api/auth/verify-magic-link:
 *   get:
 *     summary: Verify magic login link
 *     description: Verify magic login token and authenticate user
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Magic link JWT token
 *     responses:
 *       302:
 *         description: Redirect to frontend after successful authentication
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: HTTP-only cookie containing authentication token
 *       400:
 *         description: Invalid or missing token
 *       401:
 *         description: Expired or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/verifyMagicLink", verifyMagicLink);

export default router;
