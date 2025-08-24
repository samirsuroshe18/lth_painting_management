import getAccessByRole from "../config/getAccessByRole.js";
import { User } from "../models/user.model.js";

const seedSuperAdmin = async () => {
  const existing = await User.findOne({ role: "superadmin" });

  if (existing) {
    console.log("✅ Superadmin already exists");
    return;
  }

  await User.create({
    userName: process.env.SUPERADMIN_NAME,
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
    role: process.env.SUPERADMIN_ROLE || "superadmin",
    permissions: getAccessByRole(process.env.SUPERADMIN_ROLE || "superadmin"),
    isActive: true,
    isDeleted: false,
  });

  console.log("🎉 Superadmin created successfully!");
};

export default seedSuperAdmin;