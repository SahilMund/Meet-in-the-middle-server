import express from "express";

import authRoutes from "./auth.route.js";
import meetingRoutes from "./meeting.routes.js";
import notificationsRoutes from "./notifications.route.js";
import stripeRouter from "./stripe.route.js"
import userRoutes from "./user.route.js";
import verificationRoutes from "./verificationOTP.route.js";


const router = express.Router();

router.use("/user", userRoutes);
router.use("/meeting", meetingRoutes);
router.use("/auth", authRoutes);
router.use("/verification", verificationRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/stripe", stripeRouter);

export default router;
