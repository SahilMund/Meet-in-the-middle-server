import dotenv from "dotenv";
import express from "express";

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
export default router;
