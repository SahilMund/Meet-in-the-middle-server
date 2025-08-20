
import express from 'express';
import dotenv from 'dotenv';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
import { getUserInfo,login,logout,uploadToDiskStoarge,deleteUserAvatar } from '../controllers/user.controller.js';
dotenv.config();

import { upload } from "../configs/multer.js";

const router = express.Router();

router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/currUserInfo',isLoggedIn, getUserInfo);
router.post("/uploadAvatar",isLoggedIn, upload.single("image"), uploadToDiskStoarge);
router.post("/deleteAvatar",isLoggedIn, deleteUserAvatar);


export default router;
