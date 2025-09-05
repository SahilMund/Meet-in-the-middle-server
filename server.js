import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { rateLimit } from "express-rate-limit";
import passport from "passport";

import connectDB from "./src/configs/mongoose.js";
import { logger } from "./src/middlewares/logger.js";
import routes from "./src/routes/index.js";
import verificationRoutes from "./src/routes/verificationOTP.route.js";

// import User from "./src/models/user.model.js";
// import Meetings from "./src/models/meeting.model.js";
// import Participants from "./src/models/participant.model.js";
// User.deleteMany().then() //deleting users to recreate all again
// Participants.deleteMany().then() //deleting participants to recreate all again
// Meetings.deleteMany().then() //deleting Meetings to recreate all again

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // 👈 frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // 👈 allow credentials (cookies, auth headers)
  })
);

const limiter = rateLimit({
  windowMs: 60 * 60 * 100, // 1 hour
  max: 1000,
  message: "Too many requests, please try again later.",
});

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
});

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use(logger);
app.use(passport.initialize());
app.use("/api", limiter, routes);

app.use("/api/verification", verificationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
