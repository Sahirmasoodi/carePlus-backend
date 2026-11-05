require("../config/env").validateEnv();
const connectDB = require("../config/database");
const User = require("../models/User");
(async () => {
  await connectDB();
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Set SUPERADMIN_EMAIL and a SUPERADMIN_PASSWORD of at least 12 characters in backend/.env");
  const existing = await User.findOne({ email: email.toLowerCase(), hospital: null });
  if (existing) throw new Error("A super admin with this email already exists");
  await User.create({ role: "superadmin", firstName: "Platform", lastName: "Owner", email: email.toLowerCase(), password: await User.hashPassword(password), hospital: null });
  console.log(`Super admin created: ${email}`);
  process.exit(0);
})().catch(error => { console.error(error.message); process.exit(1); });
