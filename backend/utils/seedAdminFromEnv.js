const User = require("../models/User.model");

const seedAdminFromEnv = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.warn("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env — skipping admin seed");
      return;
    }

    let admin = await User.findOne({ role: "admin" });

    if (!admin) {
      admin = await User.create({
        name: ADMIN_NAME || "Platform Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE || "0000000000",
        role: "admin",
        isVerified: true,
      });
      console.log(`✅ Admin account created: ${admin.email}`);
      return;
    }

    let updated = false;

    if (admin.email !== ADMIN_EMAIL) {
      admin.email = ADMIN_EMAIL;
      updated = true;
    }

    admin.password = ADMIN_PASSWORD;
    updated = true;

    if (updated) {
      await admin.save();
      console.log(`✅ Admin account synced with .env: ${admin.email}`);
    } else {
      console.log(`Admin account already up to date: ${admin.email}`);
    }
  } catch (err) {
    console.error("Admin seed error:", err.message);
  }
};

module.exports = seedAdminFromEnv;