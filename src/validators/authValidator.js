const validator = require("validator");
const AppError = require("../utils/AppError");
function validateLogin({ email, password }) {
  if (!validator.isEmail(email || "") || !password) throw new AppError("Enter a valid email and password", 400);
}
function validatePatientSignup({ firstName, email, password }) {
  if (!firstName || !validator.isEmail(email || "") || !validator.isStrongPassword(password || "")) {
    throw new AppError("Provide your name, a valid email and a strong password", 400);
  }
}
module.exports = { validateLogin, validatePatientSignup };
