const AppError = require("../utils/AppError");
function validateHospitalInput(data) {
  const { name, email, adminFirstName, adminEmail, adminPassword, plan = "trial" } = data || {};
  if (!name || !email || !adminFirstName || !adminEmail || !adminPassword || adminPassword.length < 10) {
    throw new AppError("Hospital details and an administrator account with a 10-character password are required", 400);
  }
  if (!["trial", "basic", "professional", "enterprise"].includes(plan)) throw new AppError("Invalid subscription plan", 400);
}
module.exports = { validateHospitalInput };
