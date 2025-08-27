import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Meeting from "../models/meeting.model.js";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import Participant from "../models/participant.model.js";
import cloudinary from "../configs/cloudinary.js";
import User from "../models/user.model.js";
import { deleteAvatarFromCloudinary } from "../utils/deleteUserAvatarFromCloudinary.js";
import sendResponse from "../utils/response.util.js";
import userSettings from "../models/userSettings.mode.js";
import {
  sendDeleteConformationMail,
  sendPermanentDeletionMail,
} from "../utils/sendMail.util.js";
import schedule from "node-schedule";

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
    avartar: user.avatar,
    userSettings: userSettingsData,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    const options = {
      httpOnly: true,
      // secure: true, //uncomment before deployment
    };

    res.cookie("token", token, options);

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
      // secure: true, //uncomment before deployment
    };
    res.cookie("token", "", options);

    return sendResponse(res, "User logged out successfully", 200);
  } catch (error) {
    sendResponse(res, "Something went wrong", 500);
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
    return sendResponse(res, "File uploaded successfully", 200, data);
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
