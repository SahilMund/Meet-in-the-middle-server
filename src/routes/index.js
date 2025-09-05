import express from "express";

import meetingRoutes from "./meeting.routes.js";
import userRoutes from "./user.route.js";
import notificationsRoutes from "./notifications.route.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/meeting", meetingRoutes);
router.use("/notifications", notificationsRoutes);

export default router;
