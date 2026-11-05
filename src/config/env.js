const dotenv = require("dotenv");
dotenv.config();

function validateEnv() {
  const required = ["MONGO_URL", "JWT_SECRET", "CLIENT_URL"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  if (process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");
}
module.exports = { validateEnv };
