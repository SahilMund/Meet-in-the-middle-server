import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import passport from "passport";
import oAuth from "./src/configs/passport.js"; // initializes passport strategies

import { swaggerUi, swaggerSpec } from "./src/configs/swagger.js";
import connectDB from "./src/configs/mongoose.js";
import { logger } from "./src/middlewares/logger.js";
import { securityMiddleware } from "./src/middlewares/security.middleware.js";
import { performanceMiddleware } from "./src/middlewares/performance.middleware.js";
import routes from "./src/routes/index.js";

const app = express();
const PORT = process.env.PORT || 8000;

// ---------- Core Middlewares ----------
app.use(cookieParser());
app.use(express.json({ limit: "10kb" })); // limit payload size
app.use(express.urlencoded({ extended: true }));

// ---------- API Docs ----------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------- Security & Performance ----------
app.use(securityMiddleware);
app.use(performanceMiddleware);

// ---------- Custom Logger ----------
app.use(logger);

// ---------- Passport ----------
app.use(passport.initialize());

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use("/api", limiter, routes);


// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Resource not found",
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// ---------- Start Server ----------
connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `📘 Swagger docs available at http://localhost:${PORT}/api-docs`
    );
  });
});
