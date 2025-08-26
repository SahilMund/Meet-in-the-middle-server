import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
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

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
