import express from "express";

import { stripeWebhook } from "../webhook/stripe.webhook.js";

const router = express.Router();

// Stripe webhook – must be raw
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
