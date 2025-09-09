import express from "express";
import {
  subscribePush,
  sendPush,
} from "../controllers/notifications.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js"; // optional auth

const router = express.Router();

/**
 * Subscribe user to push notifications
 * - POST /api/notifications/subscribe
 */
router.post("/subscribe", isLoggedIn, subscribePush);

/**
 * Send push notification to all subscribers
 * - POST /api/notifications/send
 * - body: { title, body, url }
 */
router.post("/send", isLoggedIn, sendPush);

export default router;
