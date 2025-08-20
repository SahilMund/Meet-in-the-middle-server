import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatar: {
      type: String,
      default: '', // cloudinary url
    },
    role: {
      type: String,
      enum: ['personal', 'creator', 'admin'],
      default: 'personal',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(15);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
