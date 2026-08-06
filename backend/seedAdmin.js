require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User.model");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Platform Admin",
      email: "admin@fooddonation.com",
      password: "admin123", // change after first login
      phone: "9999999999",
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedAdmin();