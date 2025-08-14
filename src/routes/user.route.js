import express from "express";
import dotenv from "dotenv";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import { upload } from "../configs/multer.js";
import {
  getUserInfo,
  uploadToDiskStoarge,
} from "../controllers/user.controller.js";

dotenv.config();

const router = express.Router();

router.get("/currUserInfo", isLoggedIn, getUserInfo);
router.post("/upload/disk", upload.single("image"), uploadToDiskStoarge);

export default router;
