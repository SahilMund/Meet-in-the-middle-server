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
} from "../controllers/user.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import sendResponse from "../utils/response.util.js";
dotenv.config();

const router = express.Router();

router.post("/login", login);
router.post("/logout", isLoggedIn, logout);
router.get("/currUserInfo", isLoggedIn, getUserInfo);
router.post(
  "/uploadAvatar",
  isLoggedIn,
  upload.single("image"),
  uploadToDiskStoarge
);
router.post("/deleteAvatar", isLoggedIn, deleteUserAvatar);
router.put("/updateUserInfo", isLoggedIn, updateCurrentUser); //update user info
router.get("/getUserSettings", isLoggedIn, getUserSettings); //default settings
router.put("/putUserSettings", isLoggedIn, updateUserSettings); //change settings
router.put("/deleteUser", isLoggedIn, deleteUser);   


router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

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

    const options = {
      httpOnly: true,
      // secure: true, //uncomment before deployment
    };
    res.cookie("token", token, options);

    return sendResponse(res, "User logged in Successfully", 200, {
      data: {
        token,
        user: req.user,
      },
      success: true,
      message: "USER logged in with google successfully !!",
      redirectUrl: `http://localhost:5173/`,
    });
  }
);
export default router;
