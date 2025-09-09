import crypto from "crypto";

import dotenv from "dotenv";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model.js";

dotenv.config({ quiet: true });

// Common verify callback
const verifyCb = async (accessToken, refreshToken, profile, done) => {
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

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString("hex"); // secure random pw
      user = await User.create({
        email,
        name,
        password: randomPassword,
        avatar,
        isOAuth: true,
        authProvider: profile.provider,
      });
    }

    return done(null, user);
  } catch (error) {
    console.error("OAuth verification error:", error);
    return done(error, null);
  }
};

// Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    verifyCb
  )
);

// Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENTID,
      clientSecret: process.env.FACEBOOK_CLIENTSECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    verifyCb
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
