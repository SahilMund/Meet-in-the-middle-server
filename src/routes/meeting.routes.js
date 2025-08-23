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
} from "../controllers/meeting.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
const router = express.Router();

router.post("/createMeeting", isLoggedIn, createMeeting);
router.get("/getMeetings", isLoggedIn, getMeetings);
router.delete("/deleteMeeting", isLoggedIn, deleteMeeting);
router.put("/editMeeting/:meetingId", isLoggedIn, editMeetingById);
router.put("/acceptMeeting", isLoggedIn, acceptMeeting);
router.put("/rejectMeeting", isLoggedIn, rejectMeeting);
router.put("/conflicts", isLoggedIn, conflicts);
router.get("/getMeetings", isLoggedIn, dashboardStats);
router.get("/getMeetings", isLoggedIn, upcomingMeetings);

export default router;
