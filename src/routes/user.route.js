
import express from 'express';
import dotenv from 'dotenv';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
import { getUserInfo,login,logout,uploadToDiskStoarge,deleteUserAvatar } from '../controllers/user.controller.js';
dotenv.config();

import { upload } from "../configs/multer.js";

// const passport = require("passport");

import passport from 'passport'
import gh from '../sso-login/oAuth.js'; 



const router = express.Router();

router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/currUserInfo',isLoggedIn, getUserInfo);
router.post("/uploadAvatar",isLoggedIn, upload.single("image"), uploadToDiskStoarge);
router.post("/deleteAvatar",isLoggedIn, deleteUserAvatar);
// google oauth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

// facebook oauth
router.get("/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/");
  }
);

export default router;
