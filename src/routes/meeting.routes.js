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
  getPendingMeetings,
  scheduleMeetingReminder,
  confirmationRemainder,
  calculateEquidistantPoint,
  nearByPlaces,
  suggestedPlaces,
  finalizedLocation,
  toggleLike,
  populateSugestedPlaces,
} from "../controllers/meeting.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
const router = express.Router();

router.post("/createMeeting", isLoggedIn, createMeeting);
router.get("/getMeetings", isLoggedIn, getMeetings);
router.get("/getPendingMeetings", isLoggedIn, getPendingMeetings);
router.get("/getMeetingById/:meetingId", isLoggedIn, getMeetingById);
router.delete("/deleteMeeting/:meetingId", isLoggedIn, deleteMeeting);

router.put("/editMeeting/:meetingId", isLoggedIn, editMeetingById);

router.put("/acceptMeeting", isLoggedIn, acceptMeeting);
router.put("/rejectMeeting", isLoggedIn, rejectMeeting);
router.get("/conflicts/:meetingId", isLoggedIn, conflicts);
router.get("/getDashBoardStats", isLoggedIn, dashboardStats);
router.get("/getUpCommingMeetings", isLoggedIn, upcomingMeetings);
router.get("/getRecentActivity", isLoggedIn, recentActivity);
router.get("/upcomingMeetings", isLoggedIn, upcomingMeetings);
router.get("/recentActivity", isLoggedIn, recentActivity);
router.get("/scheduleMeetingReminder", isLoggedIn, scheduleMeetingReminder);
router.get("/confirmationRemainder", isLoggedIn, confirmationRemainder);
router.get("/calculateEquidistantPoint/:meetingId", isLoggedIn, calculateEquidistantPoint);
router.get("/getNearByPlaces/:meetingId", isLoggedIn, nearByPlaces); //Done inst
router.get("/suggestedPlaces/:meetingId", isLoggedIn, suggestedPlaces);
router.post("/populatedSugestedPlaces/:meetingId", isLoggedIn, populateSugestedPlaces);
router.put("/finalizedLocation/:meetingId", isLoggedIn, finalizedLocation);
router.put("/toggleLikes/:suggestedPlacesId", isLoggedIn, toggleLike);
export default router;
