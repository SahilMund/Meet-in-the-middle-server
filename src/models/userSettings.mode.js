import mongoose from "mongoose";

const { Schema, Types, model } = mongoose;

const userSettingsSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  pushNotifications: {
    type: Boolean,
    default: true,
  },
  meetingsReminders: {
    type: Boolean,
    default: true,
  },
  invitationsAlerts: {
    type: Boolean,
    default: true,
  },
  votingUpdates: {
    type: Boolean,
    default: true,
  },
  weeklyDigest: {
    type: Boolean,
    default: true,
  },
  locationSharing: {
    type: Boolean,
    default: true,
  },
  activityStatus: {
    type: Boolean,
    default: true,
  },
  searchableProfile: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    deletedAt: { type: Date, default: null },
    status: { type: Boolean, default: false },
  },
});
const userSettingsModel = model("userSettings", userSettingsSchema);
export default userSettingsModel;
