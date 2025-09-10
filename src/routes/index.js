import express from "express";

import meetingRoutes from "./meeting.routes.js";
import userRoutes from "./user.route.js";
import verificationRoutes from "./verificationOTP.route.js";
import authRoutes from "./auth.route.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/meeting", meetingRoutes);
app.use("/auth", authRoutes);
app.use("/verification", verificationRoutes);

export default router;
