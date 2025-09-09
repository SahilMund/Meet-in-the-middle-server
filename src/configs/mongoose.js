import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ quiet: true });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "Data",
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
  }
};

export default connectDB;
