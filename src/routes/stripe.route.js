import express from "express";

import { createBillingPortalSession, createCheckoutSession } from "../controllers/stripe.controller.js";
import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";

const router = express.Router();

// Upgrade route
router.post("/create-checkout-session", isLoggedIn, createCheckoutSession);
router.post("/create-portal-session", isLoggedIn, createBillingPortalSession);


export default router;
