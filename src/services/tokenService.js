const jwt = require("jsonwebtoken");
function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, hospital: user.hospital?.toString() || null }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}
module.exports = { signAccessToken };
