import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import userRoutes from "./src/routes/user.route.js";
import connectDB from "./src/configs/mongoose.js";
import verificationRoutes from "./src/routes/verificationOTP.route.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", userRoutes);
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

app.use("/api/user", userRoutes);
app.get("/", (req, res) => {
  res.send("API is working!");
});

app.use("/api/verification", verificationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
