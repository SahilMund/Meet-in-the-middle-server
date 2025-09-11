// controllers/push.controller.js
import webpush from "web-push";

import PushSubscription from "../models/pushSubscription.model.js";

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn("[VAPID] Keys not found in .env file");
}

// Configure VAPID keys
webpush.setVapidDetails(
  "mailto:your@email.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

/**
 * Save a new push subscription to DB
 */
export const subscribePush = async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ status: "error", message: "Invalid subscription" });
    }

    // Optionally associate subscription with logged-in user
    const email = req.user?.email || subscription.email || null;

    // Check if already exists
    const existing = await PushSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existing) {
      return res.status(200).json({ status: "success", message: "Already subscribed" });
    }

    // Save subscription in DB
    const newSub = await PushSubscription.create({
      email,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    return res.status(201).json({
      status: "success",
      message: "Subscribed successfully",
      data: newSub,
    });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Send push notification to a list of subscriptions
 * payload: { title, body, url }
 * recipients: optional array of emails
 */
export const sendPushToSubscribers = async (payload, recipients = []) => {
  try {
    const query = recipients.length ? { email: { $in: recipients } } : {}; // all subscriptions if no recipients

    const subscriptions = await PushSubscription.find(query);

    subscriptions.forEach(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        console.error("Push send failed for endpoint:", sub.endpoint, err);
      }
    });
  } catch (err) {
    console.error("Push service error:", err);
  }
};
