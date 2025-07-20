const mongoose = require("mongoose");

const User = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    private: true,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  likedSongs: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    default: [],
  },
  likedPlaylist: {
    type: String,
    default: "",
  },
  googleId: { type: String },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  subscriptionPlan: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
  },
});

const UserModel = mongoose.model("User", User);
module.exports = UserModel;