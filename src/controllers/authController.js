const { validateLogin, validatePatientSignup } = require("../validators/authValidator");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signAccessToken } = require("../services/tokenService");
const { setAuthCookie, clearAuthCookie } = require("../utils/cookies");
const assertHospitalAccessible = require("../services/hospitalAccessService");

exports.login = asyncHandler(async (req, res) => {
  const { email, password, hospitalSlug } = req.body || {};
  validateLogin({ email, password });
  let hospital = null;
  let query = { email: email.toLowerCase().trim() };
  if (hospitalSlug) {
    hospital = await Hospital.findOne({ slug: hospitalSlug.toLowerCase(), status: "active" });
    if (!hospital) throw new AppError("Please select an active hospital", 404);
    await assertHospitalAccessible(hospital);
    query.hospital = hospital._id;
  } else {
    query.hospital = null;
    query.role = "superadmin";
  }
  const user = await User.findOne(query).select("+password");
  if (!user || !user.isActive || !(await user.comparePassword(password))) throw new AppError("Email or password is incorrect", 401);
  if (user.role === "superadmin" && hospitalSlug) throw new AppError("Super administrators sign in without selecting a hospital", 400);
  if (user.role !== "superadmin" && !hospitalSlug) throw new AppError("Select your hospital to continue", 400);
  if (user.role !== "superadmin" && user.role !== "patient" && !hospital) throw new AppError("Hospital workspace not found", 403);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  setAuthCookie(res, signAccessToken(user));
  res.json({ success: true, data: user });
});

exports.signupPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, hospitalId, phone } = req.body || {};
  validatePatientSignup({ firstName, email, password });
  const hospital = await Hospital.findOne({ _id: hospitalId, status: "active", "settings.allowPatientSignup": true });
  if (!hospital) throw new AppError("Choose an available hospital from the list", 400);
  await assertHospitalAccessible(hospital);
  const exists = await User.findOne({ hospital: hospital._id, email: email.toLowerCase().trim() });
  if (exists) throw new AppError("An account with this email already exists at this hospital", 409);
  const user = await User.create({
    hospital: hospital._id, role: "patient", firstName, lastName, email: email.toLowerCase().trim(),
    password: await User.hashPassword(password), phone
  });
  setAuthCookie(res, signAccessToken(user));
  res.status(201).json({ success: true, data: user });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user, hospital: req.hospital || null } });
});
exports.logout = (req, res) => { clearAuthCookie(res); res.json({ success: true, message: "Signed out" }); };
