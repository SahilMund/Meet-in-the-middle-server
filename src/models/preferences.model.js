import mongoose from "mongoose";

const { Schema, Types, model } = mongoose;

const preferencesSchema = new Schema({
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
  inAppNotification: {
    type: Boolean,
    default: true,
  },
  locationSharing: {
    type: Boolean,
    default: false,
  },
  activityStatus: {
    type: Boolean,
    default: false,
  },
  searchableProfile: {
    type: Boolean,
    default: false,
  },
});

preferencesSchema.index({ userId: 1 }, { unique: true });
// 👉 Used in: Settings controller — ensures each user has only 1 settings document.
// Also makes quick lookup by userId efficient when fetching/updating preferences.

const userSettingsModel = model("Preferences", preferencesSchema);
export default userSettingsModel;
