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
import userSettings from "../models/userSettings.mode.js";
import { deleteAvatarFromCloudinary } from "../utils/deleteUserAvatarFromCloudinary.js";
import sendResponse from "../utils/response.util.js";
import {
  sendDeleteConformationMail,
  sendPermanentDeletionMail,
  sendMagicEmail,
} from "../utils/sendMail.util.js";
import { magicLinkMail } from "../utils/nodemailerHtml.js";
import { getDeviceInfo } from "../utils/deviceInfo.js";

export const getUserInfo = async (req, res) => {
  // Assuming req.user is set by the isLoggedIn middleware
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { email, id } = req.user;
  const user = await User.findOne({ email });
  const userSettingsData = await userSettings.findOne({ userId: id });

  // Return user information
  return sendResponse(res, "User logged in Successfully", 200, {
    email: user.email,
    id: user._id,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    userSettings: userSettingsData,
  });
};

export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("the user", user);
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, "Invalid credentials", 401);
    }
    userSettings
      .findOneAndUpdate(
        { userId: user._id },
        {
          isDeleted: {
            deletedAt: null,
            status: false,
          },
        },
        { new: true }
      )
      .then((e) => console.log(e));
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
        `<p>Hello ${user.name},</p>
     <p>A login was detected from a new device:</p>
     <ul>
       <li><b>Device:</b> ${deviceInfo.device}</li>
       <li><b>Browser:</b> ${deviceInfo.browser}</li>
       <li><b>OS:</b> ${deviceInfo.os}</li>
       <li><b>IP:</b> ${deviceInfo.ip}</li>
     </ul>
     <p>If this wasn’t you, please reset your password immediately.</p>`
      );
    }
    user.lastLoginDevice = deviceInfo;
    await user.save();
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
    };
    if (rememberMe) {
      options.maxAge = 2 * 24 * 60 * 60 * 1000;
    }

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
      maxAge: 30 * 24 * 60 * 60 * 1000,
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

    res.cookie("token", "", options);
    res.cookie("refreshToken", "", options);

    return sendResponse(res, "User logged out successfully", 200);
  } catch (error) {
    return sendResponse(res, "Something went wrong", 500);
  }
};

export const loggedInUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req?.user?.id });

    return sendResponse(res, "User logged in Successfully", 200, {
      email: user.email,
      role: user.role,
      name: user.name,
      avartar: user.avatar,
    });
  } catch (error) {
    return sendResponse(res, "Something went wrong", 500);
  }
};

//This is for user avatar upload new for first time
export const uploadToDiskStoarge = async (req, res) => {
  console.log(req);
  if (!req.file) {
    return sendResponse(res, "No file uploaded");
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

    // Step 4: Delete local file after successful upload and flolder cleanup
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

    User.findByIdAndUpdate(req.user.id, {
      avatar: data.cloudinary.url,
    })
      .then(() => {
        console.log("User avatar updated successfully");
      })
      .catch((error) => {
        console.error("Error updating user avatar:", error);
      });
    // If there is an old avatar, delete it
    if (oldAvatar) {
      deleteAvatarFromCloudinary(oldAvatar)
        .then(() => {
          console.log("Old avatar deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting old avatar:", error);
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
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    // Update user document to remove avatar
    user.avatar = "";
    await user.save();
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
      { new: true }
    );
    return sendResponse(res, "User Details Edited Sucessfully", 201, {
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
    const data = await userSettings.findOne({ userId: id });
    return sendResponse(res, "User settings fetched successfully", 200, data);
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
  }
};
//update user settings

export const updateUserSettings = async (req, res) => {
  // const {
  //   emailNotifications,
  //   pushNotifications,
  //   meetingsReminders,
  //   invitationsAlert,
  //   votingUpdates,
  //   weeklyDigest,
  //   locationSharing,
  //   activityStatus,
  //   searchableProfile,
  // } = req.body;

  try {
    const userSettingsInfo = await userSettings.findOneAndUpdate(
      {
        userId: req.user.id,
      },
      { ...req.body },
      { new: true }
    );
    console.log(userSettingsInfo);
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
  const { id } = req.user;
  try {
    const data = await userSettings.findOne({ userId: id });
    data.isDeleted.deletedAt = Date.now();
    data.isDeleted.status = true;
    await data.save();
    await sendDeleteConformationMail(req.user.email);
    // delete 30 days from now
    const runAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    schedule.scheduleJob(runAt, async function () {
      console.log(runAt.toISOString(), "...");
      try {
        await userSettings.findOneAndDelete({ userId: id });
        await User.findByIdAndDelete(id);
        const participants = await Participant.find({ user: id });
        await sendPermanentDeletionMail(req.user.email);

        if (!participants.length) return;

        const meetingIds = participants.map((p) => p.meeting); //get joined metting id's

        await Participant.deleteMany({ user: id }); //

        await Meeting.updateMany(
          { _id: { $in: meetingIds } },
          { $pull: { participants: { $in: participants.map((p) => p._id) } } }
        );

        console.log("User removed from participants and meetings updated.");
      } catch (err) {
        console.error("Error deleting user from meetings:", err);
      }
    });
    return sendResponse(
      res,
      "User Scheduled For Delete account will deleted after 30 days automatically",
      201,
      data
    );
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
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
    const { id, email, rememberMe } = decoded;
    const newAccessToken = jwt.sign({ id, email }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRY,
    });
    const newRefreshToken = jwt.sign(
      { id, email, rememberMe },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
    const refreshOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
    if (rememberMe) {
      options.maxAge = 2 * 24 * 60 * 60 * 1000;
      refreshOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
    }
    res.cookie("token", newAccessToken, options);
    res.cookie("refreshToken", newRefreshToken, refreshOptions);
    return sendResponse(res, "Token refreshed successfully", 200, {
      token: newAccessToken,
    });
  } catch (error) {
    return sendResponse(res, error.message, 500);
  }
};

export const sendMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, "user not found", 404);
    }

    const magicToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
    );

    const magicLink = `${process.env.BACKEND_URL}/user/verifyMagicLink?token=${magicToken}`;
    await sendMagicEmail(
      user.email,
      "Your Magic Login Link",
      magicLinkMail(magicLink)
    );
    return sendResponse(res, "Magic Link sent to email successfully", 200);
  } catch (error) {
    return sendResponse(res, error.message, 500);
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
    const deviceInfo = getDeviceInfo(req);
    const user = await User.findById(id);
    if (
      !user.lastLoginDevice ||
      user.lastLoginDevice.device !== deviceInfo.device
    ) {
      await sendMagicEmail(
        user.email,
        "New Device Login Alert",
        `<p>Hello ${user.name},</p>
     <p>A login was detected from a new device:</p>
     <ul>
       <li><b>Device:</b> ${deviceInfo.device}</li>
       <li><b>Browser:</b> ${deviceInfo.browser}</li>
       <li><b>OS:</b> ${deviceInfo.os}</li>
       <li><b>IP:</b> ${deviceInfo.ip}</li>
     </ul>
     <p>If this wasn’t you, please reset your password immediately.</p>`
      );
    }
    user.lastLoginDevice = deviceInfo;
    await user.save();
    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${process.env.FRONTEND_URL}/home`);
  } catch (error) {
    return sendResponse(res, error.message, 500);
  }
};
