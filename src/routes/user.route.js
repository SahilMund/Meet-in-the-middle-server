import dotenv from 'dotenv';
import express from 'express';

import { upload } from '../configs/multer.js';
import {
  getUserInfo,
  login,
  logout,
  uploadToDiskStoarge,
  deleteUserAvatar,
} from '../controllers/user.controller.js';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
dotenv.config();

const router = express.Router();

router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/currUserInfo', isLoggedIn, getUserInfo);
router.post(
  '/uploadAvatar',
  isLoggedIn,
  upload.single('image'),
  uploadToDiskStoarge
);
router.post('/deleteAvatar', isLoggedIn, deleteUserAvatar);

export default router;
