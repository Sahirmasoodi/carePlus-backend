const AppError = require("../utils/AppError");

async function assertHospitalAccessible(hospital, { persistExpiry = true } = {}) {
  if (!hospital || hospital.status !== "active") throw new AppError("This hospital workspace is unavailable", 403, "HOSPITAL_UNAVAILABLE");
  const expired = hospital.subscription?.expiresAt && new Date(hospital.subscription.expiresAt) <= new Date();
  if (expired && ["trial", "active"].includes(hospital.subscription.status)) {
    hospital.subscription.status = "expired";
    if (persistExpiry) await hospital.save();
  }
  if (["expired", "cancelled"].includes(hospital.subscription?.status)) {
    throw new AppError("This hospital subscription is inactive. Please contact the hospital or CarePlus administrator", 403, "SUBSCRIPTION_INACTIVE");
  }
  return hospital;
}
module.exports = assertHospitalAccessible;
