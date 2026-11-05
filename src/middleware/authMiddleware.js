const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const AppError = require("../utils/AppError");
const assertHospitalAccessible = require("../services/hospitalAccessService");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.careplus_token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new AppError("Please sign in to continue", 401, "AUTH_REQUIRED");
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new AppError("Your session has expired. Please sign in again", 401, "INVALID_SESSION"); }
  const user = await User.findById(decoded.sub).select("+password");
  if (!user || !user.isActive) throw new AppError("Account is unavailable", 401);
  if (user.role !== "superadmin") {
    const hospital = await Hospital.findById(user.hospital);
    await assertHospitalAccessible(hospital);
    req.hospital = hospital;
  }
  req.user = user;
  next();
});
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError("You do not have permission to perform this action", 403));
  next();
};
const requireHospital = (req, res, next) => {
  if (!req.user || req.user.role === "superadmin" || !req.user.hospital) return next(new AppError("Hospital context is required", 403));
  next();
};
module.exports = { protect, allowRoles, requireHospital };
