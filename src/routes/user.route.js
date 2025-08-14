import express from 'express';
import dotenv from 'dotenv';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
import { getUserInfo,login,logout } from '../controllers/user.controller.js';
dotenv.config();


const router = express.Router();
router.post('/login', login);
router.post('/logout', isLoggedIn, logout);
router.get('/currUserInfo',isLoggedIn, getUserInfo);

export default router;