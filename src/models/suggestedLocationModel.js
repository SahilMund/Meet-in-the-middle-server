import mongoose from "mongoose";

const suggestedLocationSchema = new mongoose.Schema({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  address: { type: String, default: "" },
  placeName: { type: String, default: null },
  rating: { type: String, default: "" },
  voteCount: { type: Number, default: 0 }, // auto-increment when user votes
  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
    },
  ], // ✅ keeps track of users who voted
  isFinalized: { type: Boolean, default: false },
  images: [{ type: String, default: null }],
});
const SuggestedLocation = mongoose.model("SuggestedLocation", suggestedLocationSchema);
export default SuggestedLocation;
