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
    locationSuggestion: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      placeName: { type: String, default: null },
    },
    suggestedLocations: [
      {
        
      }
    ]

  },
  { timestamps: true }
);

// Meeting schema
meetingSchema.index({ creator: 1 });
// 👉 Used in: "My Meetings" dashboard to fetch all meetings created by a user.

meetingSchema.index({ scheduledAt: 1 });
// 👉 Used in: Upcoming meetings reminders + calendar integrations.
// Example: send reminders for meetings happening in the next hour.

meetingSchema.index({ participants: 1 });
// 👉 Used in: Fetch all meetings where a user is a participant (dashboard, invites list).

meetingSchema.index({ scheduledAt: 1, creator: 1 });
// 👉 Used in: Analytics/dashboard filters like "Show my meetings for next 7 days".

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
