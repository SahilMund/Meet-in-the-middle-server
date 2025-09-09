import express from "express";

import {
  subscribePush,
} from "../controllers/notifications.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js"; // optional auth

const router = express.Router();

/**
 * Subscribe user to push notifications
 * - POST /api/notifications/subscribe
 */
router.post("/subscribe", isLoggedIn, subscribePush);


export default router;
