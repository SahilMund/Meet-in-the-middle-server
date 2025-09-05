import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import passport from "passport";
import oAuth from "./src/configs/passport.js";
import { rateLimit } from "express-rate-limit";

import { swaggerUi, swaggerSpec } from "./src/configs/swagger.js";
import connectDB from "./src/configs/mongoose.js";
import { logger } from "./src/middlewares/logger.js";
import routes from "./src/routes/index.js";
import verificationRoutes from "./src/routes/verificationOTP.route.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
  skip: () => process.env.NODE_ENV !== "production", // 👈 disables in dev
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(logger);
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use("/api", limiter, routes);
app.use("/api/verification", verificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

app.use((err, req, res) => {
  console.error("💥 Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `📘 Swagger docs available at http://localhost:${PORT}/api-docs`
    );
  });
});
