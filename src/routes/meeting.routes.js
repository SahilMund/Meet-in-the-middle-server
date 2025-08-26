import express from "express";

import {
  acceptMeeting,
  conflicts,
  createMeeting,
  deleteMeeting,
  editMeetingById,
  getMeetings,
  rejectMeeting,
  dashboardStats,
  upcomingMeetings,
  getMeetingById,
  recentActivity,
} from "../controllers/meeting.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
const router = express.Router();

router.post("/createMeeting", isLoggedIn, createMeeting);
router.get("/getMeetings", isLoggedIn, getMeetings);
router.delete("/deleteMeeting/:meetingId", isLoggedIn, deleteMeeting);
router.delete("/getMeetingById/:meetingId", isLoggedIn, getMeetingById);
router.put("/editMeeting/:meetingId", isLoggedIn, editMeetingById);
router.put("/acceptMeeting", isLoggedIn, acceptMeeting);
router.put("/rejectMeeting", isLoggedIn, rejectMeeting);
router.get("/conflicts/:meetingId", isLoggedIn, conflicts);

router.get("/dashboardStats", isLoggedIn, dashboardStats);
router.get("/upcomingMeetings", isLoggedIn, upcomingMeetings);
router.get("/recentActivity", isLoggedIn, recentActivity);
export default router;
