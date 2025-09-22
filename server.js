import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import webhookRoutes from "./src/routes/webhook.route.js"; // 👈 new

dotenv.config({ quiet: true });

// app.js or server.js
import eventBus from "./src/events/eventBus.js";
import registerMeetingListeners from "./src/events/MeetingListeners.js";


import express from "express";
import passport from "passport";
import oAuth from "./src/configs/passport.js"; // initializes passport strategies

import http from "http";

// eslint-disable-next-line import/no-unresolved
import { swaggerUi, swaggerSpec } from "./src/configs/swagger.js";
import connectDB from "./src/configs/mongoose.js";
import { logger } from "./src/middlewares/logger.js";
import { securityMiddleware } from "./src/middlewares/security.middleware.js";
import { performanceMiddleware } from "./src/middlewares/performance.middleware.js";
import routes from "./src/routes/index.js";

import { initSocket } from "./src/configs/socket.js";

import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

app.use("/api/stripe", webhookRoutes);

// ---------- Core Middlewares ----------
app.use(cookieParser());
app.use(express.json({ limit: "100kb" })); // limit payload size
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- API Docs ----------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------- Security & Performance ----------
app.use(securityMiddleware);
app.use(performanceMiddleware);

// ---------- Custom Logger ----------
app.use(logger);

// ---------- event listeners ----------

registerMeetingListeners(eventBus);

// ---------- Passport ----------
app.use(passport.initialize());
app.use(
  cors({
    // origin: "*",
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use("/api", routes);

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
// Create HTTP server with Express app
const server = http.createServer(app);

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");

  // 🔥 Initialize socket server
  initSocket(server);

  // Start listening on same server
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `📘 Swagger docs available at http://localhost:${PORT}/api-docs`
    );
  });
});
