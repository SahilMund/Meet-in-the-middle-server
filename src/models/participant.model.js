import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      placeName: { type: String },
    },
    meeting: {
      type: Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
    },
    conflicts: [
      {
        date: { type: Date },
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

participantSchema.index({ email: 1 });
// 👉 Used in: Invitation sending/checking if user already invited by email.

participantSchema.index({ meeting: 1 });
// 👉 Used in: Fetch all participants of a meeting (when showing participants list).

participantSchema.index({ meeting: 1, status: 1 });
// 👉 Used in: RSVP queries → e.g., "Show all Accepted participants" for notifications/reminders.

participantSchema.index({ email: 1, meeting: 1 }, { unique: true });
// 👉 Used in: Invitation creation → prevents duplicate invites for the same meeting + email.

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
