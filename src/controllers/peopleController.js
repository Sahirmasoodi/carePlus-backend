const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const hospitalId = (req) => req.hospital._id;
exports.listPeople = asyncHandler(async (req, res) => {
  const role = req.query.role;
  if (!["doctor", "patient"].includes(role)) throw new AppError("Choose doctors or patients", 400);
  const filter = { hospital: hospitalId(req), role };
  if (req.query.search) filter.$or = [
    { firstName: { $regex: req.query.search, $options: "i" } },
    { lastName: { $regex: req.query.search, $options: "i" } },
    { email: { $regex: req.query.search, $options: "i" } }
  ];
  const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: users });
});

exports.createPerson = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, ...profile } = req.body || {};
  if (!["doctor", "patient"].includes(role) || !firstName || !email || !password || password.length < 10) throw new AppError("Valid name, email, role and a 10-character temporary password are required", 400);
  const exists = await User.findOne({ hospital: hospitalId(req), email: email.toLowerCase() });
  if (exists) throw new AppError("This email already has an account in this hospital", 409);
  const user = await User.create({
    hospital: hospitalId(req), role, firstName, lastName, email: email.toLowerCase(),
    password: await User.hashPassword(password),
    ...(role === "doctor" ? { specialization: profile.specialization, department: profile.department, qualification: profile.qualification, licenseNumber: profile.licenseNumber, experience: profile.experience } : {}),
    phone: profile.phone
  });
  res.status(201).json({ success: true, data: user });
});

exports.updatePersonStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, hospital: hospitalId(req), role: { $in: ["doctor", "patient"] } });
  if (!user) throw new AppError("Person not found in this hospital", 404);
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ success: true, data: user });
});

exports.listDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ hospital: hospitalId(req), role: "doctor", isActive: true }).select("firstName lastName specialization department qualification experience profileImage");
  res.json({ success: true, data: doctors });
});