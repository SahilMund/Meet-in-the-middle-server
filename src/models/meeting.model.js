import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
    meetingLink: {
      type: String,
      required: true,
    },
    scheduledAt: {
      type: Date,
    },
    endsAt: {
      type: Date,
    },
    finalLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuggestedLocation",
        default: null,
      },
    suggestedLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuggestedLocation",
      },
    ],
  },
  { timestamps: true },
);

// 📌 Indexes
meetingSchema.index({ creator: 1 });
// "My Meetings" dashboard (all meetings created by a user)

meetingSchema.index({ scheduledAt: 1 });
// Upcoming meeting reminders + calendar integrations

meetingSchema.index({ participants: 1 });
// Fetch all meetings where a user is a participant

meetingSchema.index({ scheduledAt: 1, creator: 1 });
// Analytics/dashboard filters like "Show my meetings for next 7 days"

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
