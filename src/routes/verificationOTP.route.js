import express from "express";
import { sendOTP, verifyOTP } from "../controllers/verification.controller.js";
const router = express.Router();


router.post('/sendOtp',sendOTP);
router.post('/verifyOtp', verifyOTP);
export default router;

