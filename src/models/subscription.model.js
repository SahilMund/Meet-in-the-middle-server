import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["free", "premium"], default: "free" },
  stripeCustomerId: { type: String, required: true, unique: true },
  stripeSubscriptionId: { type: String },
  currentPeriodEnd: { type: Date }, // expiry of current billing cycle
  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "incomplete", "trialing"],
    default: "active",
  },
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
