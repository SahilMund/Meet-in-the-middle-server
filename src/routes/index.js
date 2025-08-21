import express from "express";

import meetingRoutes from "./meeting.routes.js";
import userRoutes from "./user.route.js";

const router = express.Router();

router.use("/user", userRoutes);
router.use("/meeting", meetingRoutes);

export default router;
