import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../Models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/furniture_erp";
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected for admin creation");

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@patelplywood.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisPassword@2026";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists for ${adminEmail}`);
      process.exit(0);
    }

    const admin = new User({
      name: "ERP Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      department: "Administration",
      permissions: ["*"],
      status: "active",
    });

    await admin.save();

    console.log("Admin account created successfully!");
    console.log("Email:", admin.email);

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};

createAdmin();
