const mongoose = require("mongoose");
const Permissions = require("../../../helpers/Constant.js");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["admin", "sub-admin"],
        default: "admin"
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: null
    },
    permissions: [
        {
          name: { type: String },
          view: { type: Boolean, default: false },
          edit: { type: Boolean, default: false }
        }
      ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

adminSchema.pre("save", async function () {
    if (this.role === "admin") {
      this.permissions = Permissions.map((perm) => ({
        name: perm,
        view: true,
        edit: true,
      }));
    }
  });

  adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  

module.exports = mongoose.model("Admin", adminSchema);

