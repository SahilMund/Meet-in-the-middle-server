import jwt from "jsonwebtoken";

import User from "../models/user.model.js"; // adjust path as needed
import { toMs } from "../utils/msConverter.util.js";

// helper to issue tokens + set cookies
const issueTokensAndRedirect = (res, user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY }
  );

  // Access Token cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: toMs("7d"),
  });

  // Refresh Token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: toMs("30d"), // 30 days
  });

  // redirect to frontend
  return res.redirect("http://localhost:5173/home");
};

export const oauthCallback = async (req, res) => {
  try {
    const { email, name, provider } = req.user;

    // check if user exists
    let foundUser = await User.findOne({ email });

    // optional: create user if not found
    if (!foundUser) {
      foundUser = await User.create({ email, name, provider });
    }

    return issueTokensAndRedirect(res, foundUser);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.redirect("http://localhost:5173/login?error=oauth_failed");
  }
};
