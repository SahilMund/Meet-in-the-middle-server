import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();
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
    console.log("profile", profile);
    // const user = await User.findOne({ email: profile.email[0].value });
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        password,
        avatar,
        isOAuth: true,
        authProvider: profile.provider,
      });
    }
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error, null);
  }
};
// google auth
console.log(
  process.env.GOOGLE_CLIENTID,
  process.env.GOOGLE_CLIENTSECRET,
  process.env.GOOGLE_CALLBACK
);
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
// facebook sso
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

passport.serializeUser((user, done) => {
  done(null, user._id); // store user id in session
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
