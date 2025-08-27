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
  recentActivity
} from "../controllers/meeting.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
const router = express.Router();

router.post("/createMeeting", isLoggedIn, createMeeting);
router.get("/getMeetings", isLoggedIn, getMeetings);
router.get("/getSingleMeeting/:meetingId", isLoggedIn, getMeetingById);
router.delete("/deleteMeeting/:meetingId", isLoggedIn, deleteMeeting);
router.put("/editMeeting/:meetingId", isLoggedIn, editMeetingById);
router.put("/acceptMeeting", isLoggedIn, acceptMeeting);
router.put("/rejectMeeting", isLoggedIn, rejectMeeting);
router.put("/conflicts/:meetingId", isLoggedIn, conflicts);
router.get("/getDashBoardStats", isLoggedIn, dashboardStats);
router.get("/getUpCommingMeetings", isLoggedIn, upcomingMeetings);
router.get("/getRecentActivity", isLoggedIn, recentActivity);

export default router;
