import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import jwt from "jsonwebtoken";
import schedule from "node-schedule";
import sharp from "sharp";

import cloudinary from "../configs/cloudinary.js";
import Meeting from "../models/meeting.model.js";
import Participant from "../models/participant.model.js";
import User from "../models/user.model.js";
import Preferences from "../models/preferences.model.js";
import { deleteAvatarFromCloudinary } from "../utils/deleteUserAvatarFromCloudinary.js";
import sendResponse from "../utils/response.util.js";
import {
  sendDeleteConformationMail,
  sendPermanentDeletionMail,
  sendMagicEmail,
} from "../utils/sendMail.util.js";
import { toMs } from "../utils/msConverter.util.js";
import { magicLinkMail } from "../utils/nodemailerHtml.js";
import { getDeviceInfo } from "../utils/deviceInfo.js";
import newDeviceLoginTemplate from "../emailTemplates/newDeviceLoginTemplete.js";
import Subscription from "../models/subscription.model.js";


export const getUserInfo = async (req, res) => {
  // Assuming req.user is set by the isLoggedIn middleware
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //Improvements:
  // Use .lean() when not modifying data → improves performance.
  // Combine queries with Promise.all to avoid sequential DB calls.

  const { email, id } = req.user;
  // const user = await User.findOne({ email });
  // const Preferences = await Preferences.findOne({ userId: id });

  const [user, preferences, subscription] = await Promise.all([
    User.findOne({ email }).lean(),
    Preferences.findOne({ userId: id }).lean(),
    Subscription.findOne({ user: id }).select(
      "plan currentPeriodEnd status"
    )
  ]);

    return sendResponse(res, "User logged in Successfully", 200, {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
       bio: user.bio,
    phone: user.phone,
    location: user.location,
    Preferences: preferences,
      subscription: subscription
        ? {
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
            status: subscription.status,
          }
        : {
            plan: "free",
            currentPeriodEnd: null,
            status: "active",
          },
    });

};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    // console.log("the user", user);
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, "Invalid credentials", 401);
    }

    // Update user settings in parallel with other operations
    Preferences.findOneAndUpdate(
      { userId: user._id },
      {
        isDeleted: {
          deletedAt: null,
          status: false,
        },
      },
      { new: true, upsert: true } // Added upsert in case settings don't exist
    ).catch((error) => {
      // Log but don't fail login for settings update errors
      console.error("User settings update failed:", error);
    });

    const deviceInfo = getDeviceInfo(req);
    if (
      !user.lastLoginDevice ||
      user.lastLoginDevice.device !== deviceInfo.device ||
      user.lastLoginDevice.os !== deviceInfo.os ||
      user.lastLoginDevice.browser !== deviceInfo.browser ||
      user.lastLoginDevice.ip !== deviceInfo.ip
    ) {
      await sendMagicEmail(
        user.email,
        "New Device Login Alert",
        newDeviceLoginTemplate(deviceInfo, user.name)
      );
    }

    // user.lastLoginDevice = deviceInfo;
    // await user.save();
    // Update user with new device info and last login
    await User.findByIdAndUpdate(
      user._id,
      {
        lastLoginDevice: deviceInfo,
        lastLoginAt: new Date(),
      },
      { new: true }
    );

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        rememberMe,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? toMs("2d") : toMs("4h"), // shorter if not remembered
    };
    console.log("here")

    //refresh token
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, rememberMe },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );
    res.cookie("token", token, options);

    const refreshOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: toMs("30d"),
    };
    res.cookie("refreshToken", refreshToken, refreshOptions);

    return sendResponse(res, "User logged in Successfully", 200, {
      user,
      token,
    });
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};

export const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // enable HTTPS only in prod
      sameSite: "strict",
      maxAge: 0, // expire immediately
    };

    // use clearCookie instead of setting empty string as cookies
    res.clearCookie("token", options);
    res.clearCookie("refreshToken", options);

    return sendResponse(res, "User logged out successfully", 200);
  } catch (error) {
    return sendResponse(res, "Something went wrong", 500);
  }
};

export const loggedInUserInfo = async (req, res) => {
  try {
    // const user = await User.findOne({ _id: req?.user?.id });

    // Fetch fresh user data but only select necessary fields
    const user = await User.findById(req.user.id).select(
      "email name avatar role createdAt updatedAt"
    );

    return sendResponse(res, "User logged in Successfully", 200, {
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Error fetching logged in user info:", error);
    return sendResponse(res, "Something went wrong", 500);
  }
};


//This is for user avatar upload new for first time
export const uploadToDiskStorage = async (req, res) => {
  console.log(req);
  if (!req.file) {
    return sendResponse(res, "No file uploaded");
  }

  // Validate file type
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return sendResponse(
      res,
      "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed",
      400
    );
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    //step 1: Check if file is provided
    const uploadDir = path.join(__dirname, "../uploads", req.user.id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const resizedFileName = `resized-${Date.now()}.jpeg`;
    const resizedFilePath = path.join(uploadDir, resizedFileName);
    // Step 2: Resize the image using sharp
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .toFile(resizedFilePath);

    // Step 3: Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(resizedFilePath, {
      folder: `user_uploads/${req.user.id}`, // Optional folder in Cloudinary
      resource_type: "image",
    });

    // Step 4: Delete local file after successful upload and folder cleanup
    fs.unlinkSync(resizedFilePath);
    fs.rmSync(uploadDir, { recursive: true });

    // Step 5: Send response with Cloudinary info
    const data = {
      cloudinary: {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
      },
    };

    let user = await User.findById(req.user.id);
    let oldAvatar = user.avatar;

    // Step 4: Update user with new avatar (atomic operation)
    await User.findByIdAndUpdate(
      req.user.id,
      { avatar: data.cloudinary.url },
      { new: true, select: "-password" } // Return updated user without password
    );

    // User.findByIdAndUpdate(req.user.id, {
    //   avatar: data.cloudinary.url,
    // })
    //   .then(() => {
    //     console.log("User avatar updated successfully");
    //   })
    //   .catch((error) => {
    //     console.error("Error updating user avatar:", error);
    //   });

    // Delete old avatar if it exists (non-blocking)
    if (oldAvatar) {
      deleteAvatarFromCloudinary(oldAvatar)
        .then(() => {
          console.log("Old avatar deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting old avatar:", error);
          // Log but don't fail the request for cleanup errors
        });
    }
    return sendResponse(res, "Profile uploaded successfully", 200, data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "File upload failed" });
  }
};

//delete user avatar
export const deleteUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.avatar) {
      return sendResponse(res, "No avatar found for this user", 404);
    }

    // Delete the avatar from Cloudinary
    const publicId = user.avatar.split("/").pop().split(".")[0]; // Extract public_id from URL

    if (!publicId) {
      console.error("Could not extract public_id from URL:", user.avatar);
      // Continue with user update even if public_id extraction fails
    } else {
      // Delete the avatar from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });

        console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);

        // Check if error is "not found" - we can still proceed with user update
        if (cloudinaryError.http_code !== 404) {
          console.warn(
            "Cloudinary deletion failed, but proceeding with user update"
          );
        }
      }
    }

    // await cloudinary.uploader.destroy(publicId, {
    //   resource_type: "image",
    // });

    // Update user document to remove avatar using atomic operation
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: { avatar: 1 }, // Use $unset to remove the field entirely
      },
      {
        new: true,
        select: "-password", // Return updated user without password
      }
    );

    return sendResponse(res, "User avatar deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting user avatar:", error);
    return sendResponse(res, "Failed to delete user avatar", 500);
  }
};

//Edit current user information
export const updateCurrentUser = async (req, res) => {
  const { avatar, name, phone, location, bio } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar,
        name,
        phone,
        location,
        bio,
      },
      {
        new: true,
        runValidators: true,
        select: "-password -__v", // Exclude multiple fields
      }
    );

    return sendResponse(res, "User Details Edited successfully", 201, {
      ...user.toJSON(),
      password: null,
    });
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};

export const getUserSettings = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await Preferences.findOne({ userId: id })
      .select("-__v") // Exclude version key
      .lean(); // Return plain JavaScript object

    return sendResponse(res, "User settings fetched successfully", 200, data);
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};

//update user settings
export const updateUserSettings = async (req, res) => {
  try {
    const userSettingsInfo = await Preferences.findOneAndUpdate(
      {
        userId: req.user.id,
      },
      { ...req.body },
      { new: true, upsert: true, runValidators: true, select: "-__v" }
    );

    return sendResponse(
      res,
      "User settings updated successfully",
      200,
      userSettingsInfo
    );
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};

export const deleteUser = async (req, res) => {
  const { id: userId } = req.user;

  const DELETION_GRACE_PERIOD_DAYS = 30;
  const DELETION_GRACE_PERIOD_MS =
    DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

  try {
    // Find user preferences and update deletion status in one operation
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          "isDeleted.deletedAt": new Date(),
          "isDeleted.status": true,
        },
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validation
      }
    );

    if (!user) {
      return sendResponse(res, "User not found", 404);
    }

    // Send confirmation email (non-blocking)
    sendDeleteConformationMail(req.user.email)
      .then(() =>
        console.log(`Deletion confirmation sent to ${req.user.email}`)
      )
      .catch((error) =>
        console.error("Failed to send deletion confirmation:", error)
      );

    // delete 30 days from now
    // const runAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // schedule.scheduleJob(runAt, async function () {
    //   console.log(runAt.toISOString(), "...");
    //   console.log(`Executing permanent deletion for user: ${userId}`);

    //   try {
    //     await Preferences.findOneAndDelete({ userId: id });
    //     await User.findByIdAndDelete(id);
    //     const participants = await Participant.find({ user: id });
    //     await sendPermanentDeletionMail(req.user.email);

    //     if (!participants.length) return;

    //     const meetingIds = participants.map((p) => p.meeting); //get joined metting id's

    //     // Delete participants
    //     await Participant.deleteMany({ user: id });

    //     // Remove user from meetings
    //     await Meeting.updateMany(
    //       { _id: { $in: meetingIds } },
    //       { $pull: { participants: { $in: participants.map((p) => p._id) } } }
    //     );

    //     console.log("User removed from participants and meetings updated.");
    //   } catch (err) {
    //     console.error("Error deleting user from meetings:", err);
    //   }
    // });

    const runAt = new Date(Date.now() + DELETION_GRACE_PERIOD_MS);

    schedule.scheduleJob(runAt, async function () {
      try {
        console.log(`Executing permanent deletion for user: ${userId}`);

        // Find all participants for this user
        const participants = await Participant.find({ user: userId });

        if (participants.length > 0) {
          const meetingIds = participants.map((p) => p.meeting);
          const participantIds = participants.map((p) => p._id);

          // Remove user from meetings
          await Meeting.updateMany(
            { _id: { $in: meetingIds } },
            { $pull: { participants: { $in: participantIds } } }
          );

          // Delete participants
          await Participant.deleteMany({ user: userId });
        }

        // Delete user and preferences
        await Promise.all([
          Preferences.findOneAndDelete({ userId: userId }),
          User.findByIdAndDelete(userId),
        ]);

        // Send final deletion email
        await sendPermanentDeletionMail(req.user.email);

        console.log(`Successfully permanently deleted user: ${userId}`);
      } catch (err) {
        console.error("Error during permanent deletion:", err);
        // Log the error but don't throw - the job will be retried on server restart
      }
    });
    return sendResponse(
      res,
      `User scheduled for deletion. Account will be permanently deleted after ${DELETION_GRACE_PERIOD_DAYS} days.`,
      202,
      user
    );
  } catch (error) {
    return sendResponse(res, "Failed to schedule user deletion", 500);
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return sendResponse(res, "No refresh token provided", 404);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY
    );
    const { id, email } = decoded;

    // Check if user still exists and is active
    const user = await User.findById(id).select("isDeleted");
    if (!user) {
      return sendResponse(res, "User not found", 403);
    }

    if (user.isDeleted.status) {
      return sendResponse(res, "User account is inactive", 403);
    }

    // New Access Token
    const newAccessToken = jwt.sign({ id, email }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: toMs("2d"), // access token cookie life
    };

    res.cookie("token", newAccessToken, options);

    return sendResponse(res, "Token refreshed successfully", 200, {
      token: newAccessToken,
    });
  } catch (error) {
    // Clear invalid tokens from cookies on error
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    // Specific error messages
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, "Refresh token expired", 401);
    }

    if (error.name === "JsonWebTokenError") {
      return sendResponse(res, "Invalid refresh token", 401);
    }

    return sendResponse(res, error.message, 500);
  }
};

export const sendMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isDeleted.status) {
      return sendResponse(
        res,
        "If an account exists with this email, a magic link will be sent",
        200
      );
    }

    const magicToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
    );

    // const magicLink = `${process.env.BACKEND_URL}/user/verifyMagicLink?token=${magicToken}`;

    // Construct magic link with proper URL encoding
    const magicLink = new URL(
      `${process.env.BACKEND_URL}/user/verifyMagicLink`
    );
    magicLink.searchParams.append("token", magicToken);

    // Send email (non-blocking)
    sendMagicEmail(
      user.email,
      "Your Magic Login Link",
      magicLinkMail(magicLink.toString())
    )
      .then(() => {
        console.log(`Magic link email sent to: ${user.email}`);
      })
      .catch((error) => {
        console.error(
          `Failed to send magic link email to ${user.email}:`,
          error
        );
      });

    return sendResponse(
      res,
      "If an account exists with this email, a magic link will be sent",
      200
    );
  } catch (error) {
    console.error("Magic link error:", error);

    // Don't expose specific error details to client
    return sendResponse(res, "Failed to process magic link request", 500);
  }
};

export const verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return sendResponse(res, "Token missing", 400);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const { id, email } = decoded;

    const loginToken = jwt.sign({ id, email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    const user = await User.findById(id);

    if (!user) {
      return sendResponse(res, "User account not found", 404);
    }

    if (user.isActive === false) {
      return sendResponse(res, "User account is inactive", 403);
    }

    // Verify email matches (in case user changed email after token was issued)
    if (user.email !== email) {
      return sendResponse(res, "Invalid authentication request", 400);
    }

    const deviceInfo = getDeviceInfo(req);

    // Check for new device login
    const isNewDevice =
      !user.lastLoginDevice ||
      user.lastLoginDevice.device !== deviceInfo.device ||
      user.lastLoginDevice.os !== deviceInfo.os ||
      user.lastLoginDevice.browser !== deviceInfo.browser;

    if (isNewDevice) {
      // Send new device alert (non-blocking)
      sendMagicEmail(
        user.email,
        "New Device Login Alert",
        newDeviceLoginTemplate(deviceInfo, user.name) // Use your template function
      ).catch((error) => {
        console.error("Failed to send new device email:", error);
      });
    }

    // Update user's last login device and timestamp using atomic operation
    await User.findByIdAndUpdate(
      id,
      {
        $set: {
          lastLoginDevice: deviceInfo,
          lastLoginAt: new Date(),
        },
      },
      {
        runValidators: true, // Ensure schema validation
        timestamps: false, // Prevent updatedAt from being overwritten
      }
    );

    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Safe redirect - validate and use configured frontend URL
    const frontendUrl = new URL(
      process.env.FRONTEND_URL || "http://localhost:5137"
    );
    const redirectUrl = new URL("/home", frontendUrl).toString();

    return res.redirect(redirectUrl);
  } catch (error) {
    // Specific error handling
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, "Magic link has expired", 401);
    }

    if (error.name === "JsonWebTokenError") {
      return sendResponse(res, "Invalid magic link", 400);
    }

    if (error.name === "TypeError" && error.message.includes("URL")) {
      return sendResponse(res, "Configuration error", 500);
    }

    return sendResponse(res, "Authentication failed", 500);
  }
};
