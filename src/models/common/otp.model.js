const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    phone: {
      type: String,
      unique: true
    },
    otp: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 60 // ⏳ 60 seconds = 1 minute
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Otp", otpSchema);
