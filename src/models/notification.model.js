// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who should receive
    type: {
      type: String,
      enum: [
        "MEETING_CREATED",
        "MEETING_ACCEPTED",
        "MEETING_REJECTED",
        "MEETING_DELETED",
      ],
      required: true,
    },

    message: { type: String, required: true },
    data: { type: Object }, // optional (meetingId, status, etc.)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
