import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Data',
    });
    // console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }
};

export default connectDB;
