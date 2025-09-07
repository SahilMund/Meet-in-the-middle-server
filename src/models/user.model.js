import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String,
      default: "", // cloudinary url
    },
    settings: {
      type: Schema.Types.ObjectId,
      ref: "userSettingsModel",
    },

    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    authProvider: {
      type: String,
      enum: ["google", "facebook", "local"],
      default: "local",
    },
    // For Google Calendar
    googleAccessToken: String,
    googleRefreshToken: String,
    lastLoginDevice: {
      browser: { type: String },
      os: { type: String },
      device: { type: String },
      ip: { type: String },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(15);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
