import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // link subscription to a user
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
