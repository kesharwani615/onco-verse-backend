const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
 
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
 
    phone: {
      type: String,
    },
 
    otp: {
      type: String,
      required: true,
    },
 
    type: {
      type: String,
      enum: ["phone", "email"],
      required: true,
    },
 
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Auto delete after 60 sec
    },
  },
  {
    timestamps: true,
  }
);
 
module.exports = mongoose.model("Otp", otpSchema);