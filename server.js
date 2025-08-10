import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/configs/mongoose.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
});

app.get("/", (req, res) => {
  res.send("API is working!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
