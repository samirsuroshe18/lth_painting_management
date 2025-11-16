import { config } from "../config/env.js";
import getAccessByRole from "../config/getAccessByRole.js";
import { User } from "../models/user.model.js";

const seedSuperAdmin = async () => {
  const existing = await User.findOne({ role: "superadmin" });

  if (existing) {
    console.log("✅ Superadmin already exists");
    return;
  }

  await User.create({
    userName: config.superAdmin.name,
    email: config.superAdmin.email,
    password: config.superAdmin.password,
    role: config.superAdmin.role || "superadmin",
    permissions: getAccessByRole(config.superAdmin.role || "superadmin"),
    isActive: true,
    isDeleted: false,
  });

  console.log("🎉 Superadmin created successfully!");
};

export default seedSuperAdmin;