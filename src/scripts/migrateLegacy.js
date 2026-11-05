require("../config/env").validateEnv();
const connectDB = require("../config/database");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
(async () => {
  await connectDB();
  const legacy = await User.findOne({ role: { $in: ["doctor", "patient", "admin"] }, hospital: null });
  if (!legacy) { console.log("No legacy users found. Nothing to migrate."); process.exit(0); }
  const name = process.env.LEGACY_HOSPITAL_NAME || "CarePlus Legacy Hospital";
  let hospital = await Hospital.findOne({ slug: "careplus-legacy" });
  if (!hospital) hospital = await Hospital.create({ name, slug: "careplus-legacy", email: process.env.LEGACY_HOSPITAL_EMAIL || "legacy@careplus.local", status: "active", subscription: { plan: "enterprise", status: "active" } });
  const result = await User.updateMany({ role: { $in: ["doctor", "patient", "admin"] }, hospital: null }, { $set: { hospital: hospital._id } });
  console.log(`Migrated ${result.modifiedCount} legacy accounts to ${hospital.name}. Review and migrate appointments and prescriptions separately.`);
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
