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
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
