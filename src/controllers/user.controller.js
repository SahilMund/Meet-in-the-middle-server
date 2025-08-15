import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendResponse from "../utils/response.util.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import cloudinary from "../configs/cloudinary.js";

export const getUserInfo = async (req, res) => {
  // Assuming req.user is set by the isLoggedIn middleware
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { email } = req.user;
  const user = await User.findOne({ email });

  // Return user information
  return sendResponse(res, "User logged in Successfully", 200, {
    email: user.email,
    role: user.role,
    name: user.name,
    avartar: user.avatar,
  });
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
    return sendResponse(res, "Something went wrong", 500);
  }
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
      email: user.email,
      role: user.role,
      name: user.name,
      avartar: user.avatar,
      token,
    });
  } catch (error) {
    return sendResponse(res, "Something went wrong", 500);
  }
};

//This is for user avatar
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
    fs.rmdirSync(uploadDir, { recursive: true });

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
    User.findByIdAndUpdate(req.user.id, {
      avatar: data.cloudinary.url,
    })
      .then(() => {
        console.log("User avatar updated successfully");
      })
      .catch((error) => {
        console.error("Error updating user avatar:", error);
      });

    sendResponse(res, "File uploaded successfully", 200, data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "File upload failed" });
  }
};
