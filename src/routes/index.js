import express from "express";

import meetingRoutes from "./meeting.routes.js";
import userRoutes from "./user.route.js";
import notificationsRoutes from "./notifications.route.js";
import verificationRoutes from "./verificationOTP.route.js";
import authRoutes from "./auth.route.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/meeting", meetingRoutes);
router.use("/auth", authRoutes);
router.use("/verification", verificationRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
