import { sendNotification } from "../configs/socket.js";
import Notification from "../models/notification.model.js";
import Preferences from '../models/preferences.model.js'


/**
 * Create notification in DB + emit via socket
 */
export const createAndSendNotification = async (
  userId,
  type,
  message,
  data = {}
) => {
  try {

    const pref = await Preferences.findOne({ userId })
      .lean()
      .select("inAppNotification");

    if (!pref || !pref.inAppNotification) {
      console.log("[inAppNotification]: Skipping notification as preference is disabled");
      return null;
    }

    const notification = await Notification.create({
      user: userId,
      type,
      message,
      data,
    });

    // Real-time push
    sendNotification(userId.toString(), {
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      data: notification.data,
        isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    console.log(`Notification sent: ${message}`);
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
