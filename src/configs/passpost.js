import dotenv from "dotenv";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model.js";

dotenv.config();

const verifyCb = async (accessToken, refreshToken, profile, done) => {
  try {
    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : null;
    console.log({ profile });
    const name = profile.displayName || "No Name";
    const avatar =
      profile.photos && profile.photos.length > 0
        ? profile.photos[0].value
        : "";

    console.log("🔥 Google/Facebook profile:", profile);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar,
        isOAuth: true,
        authProvider: profile.provider, // "google" or "facebook"
      });
    }
    done(null, user);
  } catch (error) {
    console.error("Error in verifyCb:", error);
    done(error, null);
  }
};

// google auth
// console.log(
//   process.env.GOOGLE_CLIENTID,
//   process.env.GOOGLE_CLIENTSECRET,
//   process.env.GOOGLE_CALLBACK
// );
const googleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
};

passport.use(new GoogleStrategy(googleStrategyOptions, verifyCb));

// facebook sso
// const facebookStrategyOptions = {
//   clientID: process.env.FACEBOOK_CLIENTID,
//   clientSecret: process.env.FACEBOOK_CLIENTSECRET,
//   callbackURL: process.env.FACEBOOK_CALLBACK,
//   profileFields: ["id", "emails", "name", "displayName", "photos"],
// };

// passport.use(new FacebookStrategy(facebookStrategyOptions, verifyCb));

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
