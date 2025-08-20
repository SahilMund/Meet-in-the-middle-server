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
  { _id: false }
);

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
