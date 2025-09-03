import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import { upload } from "../configs/multer.js";
import {
  getUserInfo,
  login,
  logout,
  uploadToDiskStoarge,
  deleteUserAvatar,
  updateCurrentUser,
  getUserSettings,
  updateUserSettings,
  deleteUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Logs in a user with email and password.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the current user
 *       - in: query
 *         name: email
 *         required: false
 *         schema:
 *           type: string
 *         description: Name of the current user
 *       - in: query
 *         name: password
 *         required: false
 *         schema:
 *           type: string
 *           format: password
 *         description: Name of the current user
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
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
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

/**
 * @swagger
 * /user/currUserInfo:
 *   get:
 *     summary: Get current user info
 *     description: Fetches details of the currently authenticated user.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the current user
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Name of the current user
 *     responses:
 *       200:
 *         description: User info retrieved successfully
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
 *                   example: "Current user info retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */

router.get("/currUserInfo", isLoggedIn, getUserInfo);

/**
 * @swagger
 * /uploadAvatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Uploads a new avatar image for the authenticated user.
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post(
  "/uploadAvatar",
  isLoggedIn,
  upload.single("image"),
  uploadToDiskStoarge
);

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
 * /updateUserInfo:
 *   put:
 *     summary: Update user info
 *     description: Updates details of the currently authenticated user.
 *     responses:
 *       200:
 *         description: User info updated successfully
 */
router.put("/updateUserInfo", isLoggedIn, updateCurrentUser);

/**
 * @swagger
 * /getUserSettings:
 *   get:
 *     summary: Get user settings
 *     description: Fetches default settings of the authenticated user.
 *     responses:
 *       200:
 *         description: User settings retrieved
 */
router.get("/getUserSettings", isLoggedIn, getUserSettings);

/**
 * @swagger
 * /putUserSettings:
 *   put:
 *     summary: Update user settings
 *     description: Updates settings of the authenticated user.
 *     responses:
 *       200:
 *         description: User settings updated
 */
router.put("/putUserSettings", isLoggedIn, updateUserSettings);

/**
 * @swagger
 * /deleteUser:
 *   put:
 *     summary: Delete user account
 *     description: Deletes the authenticated user’s account.
 *     responses:
 *       200:
 *         description: User deleted successfully
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
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Google callback
 *     description: Handles Google authentication callback and returns JWT.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        email: req.user.email,
        name: req.user.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );


    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


 // Redirect frontend, let it fetch /currUserInfo with the cookie
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173/home");
  }
);

/**
 * @swagger
 * /facebook:
 *   get:
 *     summary: Facebook login
 *     description: Redirects user to Facebook authentication.
 */
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }) // request email explicitly
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
  (req, res) => {
    const token = jwt.sign(
      {
        email: req.user.email,
        name: req.user.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // only HTTPS in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


 // Redirect frontend, let it fetch /currUserInfo with the cookie
    res.redirect("http://localhost:5173/home");
  }
);

router.post("/refreshAccessToken", refreshAccessToken);

export default router;
