import crypto from "crypto";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

dotenv.config({ quiet: true });

/**
 * Common user creation/update logic
 */
const upsertUser = async ({
  email,
  name,
  avatar,
  provider,
  accessToken,
  refreshToken,
}) => {
  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex");
    user = await User.create({
      email,
      name,
      password: randomPassword,
      avatar,
      authProvider: provider,
      ...(provider === "google" && {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
      }),
    });
  } else {
    // Update tokens for Google only
    if (provider === "google") {
      user.googleAccessToken = accessToken;
      user.googleRefreshToken = refreshToken;
      await user.save();
    }
  }

  return user;
};

/**
 * Google strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/calendar.events",
      ], // include calendar scope
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        const name = profile.displayName || "No Name";
        const avatar =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : "";

        console.log("token", {
          accessToken,
          refreshToken,
          profile,
        });
        const user = await upsertUser({
          email,
          name,
          avatar,
          provider: "google",
          accessToken,
          refreshToken,
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

/**
 * Facebook strategy
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        const name = profile.displayName || "No Name";
        const avatar =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : "";

        const user = await upsertUser({
          email,
          name,
          avatar,
          provider: "facebook",
          // ⛔️ Don’t store FB tokens for calendar integration
        });

        return done(null, user);
      } catch (error) {
        console.error("Facebook OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// Only needed if using sessions
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
