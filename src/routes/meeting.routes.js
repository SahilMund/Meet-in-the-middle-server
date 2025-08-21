import express from "express";

import {
  acceptMeeting,
  conflicts,
  createMeeting,
  deleteMeeting,
  editMeetingById,
  getMeetings,
  rejectMeeting,
} from "../controllers/meeting.controller";
import isLoggedIn from "../middlewares/isLoggedIn.middleware";
const router = express.Router();

router.post("/createMeeting", isLoggedIn, createMeeting);
router.get("/getMeetings", isLoggedIn, getMeetings);
router.delete("/deleteMeeting", isLoggedIn, deleteMeeting);
router.put("/editMeeting/:meetingId", isLoggedIn, editMeetingById);
router.put("/acceptMeeting", isLoggedIn, acceptMeeting);
router.put("/rejectMeeting", isLoggedIn, rejectMeeting);
router.put("/conflicts", isLoggedIn, conflicts);

export default router;
