
import express from 'express';
import dotenv from 'dotenv';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
import { getUserInfo,login,logout,uploadToDiskStoarge } from '../controllers/user.controller.js';
dotenv.config();

import { upload } from "../configs/multer.js";

const router = express.Router();

router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/currUserInfo',isLoggedIn, getUserInfo);

router.post("/upload/disk", upload.single("image"), uploadToDiskStoarge);


export default router;
