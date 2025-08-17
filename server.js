import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";

// import expressSession from "express-session";
import session from "express-session";
import passport from "passport";

import userRoutes from "./src/routes/user.route.js";
import connectDB from "./src/configs/mongoose.js";
import verificationRoutes from "./src/routes/verificationOTP.route.js";
import cloudinary from "./src/configs/cloudinary.js";
import { logger } from "./src/middlewares/logger.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Allow all origins, change origins if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
});

// session MUST come before passport
app.use(
  session({
    secret: "123abcxyz",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true if HTTPS
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(logger); // Use logger middleware for logging requests

app.use("/api/user", userRoutes);

app.use("/api/verification", verificationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
