require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const adminModel = require("../models/admin/auth/admin.model.js");

const seedAdmin = async () => {
  try {
    // 🔥 CONNECT DATABASE HERE
    require("../config/dbConnections");
    const existingAdmin = await adminModel.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await adminModel.create({
      fullName: "Super Admin",
      email: "admin@oncoverse.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      isDeleted: false,
    });

    console.log("🔥 Admin Created Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedAdmin();
