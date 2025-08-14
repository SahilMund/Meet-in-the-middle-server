import express from 'express';
import dotenv from 'dotenv';
import isLoggedIn from '../middlewares/isLoggedIn.middleware.js';
import { getUserInfo } from '../controllers/user.controller.js';
dotenv.config();


const router = express.Router();

router.get('/currUserInfo',isLoggedIn, getUserInfo);

export default router;