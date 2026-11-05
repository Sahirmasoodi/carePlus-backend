const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const slugify = require("../utils/slugify");
const { validateHospitalInput } = require("../validators/hospitalValidator");

exports.overview = asyncHandler(async (req, res) => {
  const [hospitals, active, suspended, users] = await Promise.all([
    Hospital.countDocuments(), Hospital.countDocuments({ status: "active" }),
    Hospital.countDocuments({ status: "suspended" }), User.countDocuments({ role: { $ne: "superadmin" } })
  ]);
  res.json({ success: true, data: { hospitals, active, suspended, users } });
});

exports.listHospitals = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = [
    { name: { $regex: req.query.search, $options: "i" } },
    { email: { $regex: req.query.search, $options: "i" } },
    { slug: { $regex: req.query.search, $options: "i" } }
  ];
  const data = await Hospital.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data });
});

exports.createHospital = asyncHandler(async (req, res) => {
  const { name, email, city, address, phone, adminFirstName, adminLastName, adminEmail, adminPassword, plan = "trial" } = req.body || {};
  validateHospitalInput(req.body);
  const baseSlug = slugify(name);
  let slug = baseSlug, suffix = 2;
  while (await Hospital.exists({ slug })) slug = `${baseSlug}-${suffix++}`;
  const days = Number(process.env.TRIAL_DAYS || 14);
  const hospital = await Hospital.create({
    name, slug, email, city, address, phone, status: "active",
    subscription: { plan, status: plan === "trial" ? "trial" : "active", startedAt: new Date(), ...(plan === "trial" ? { expiresAt: new Date(Date.now() + days * 86400000) } : {}) }
  });
  try {
    const admin = await User.create({
      hospital: hospital._id, role: "admin", firstName: adminFirstName, lastName: adminLastName,
      email: adminEmail.toLowerCase(), password: await User.hashPassword(adminPassword)
    });
    res.status(201).json({ success: true, data: { hospital, admin: { id: admin._id, email: admin.email } } });
  } catch (error) {
    await Hospital.findByIdAndDelete(hospital._id);
    throw error;
  }
});

exports.updateHospitalStatus = asyncHandler(async (req, res) => {
  const { status, suspensionReason } = req.body || {};
  if (!["active", "suspended"].includes(status)) throw new AppError("Status must be active or suspended", 400);
  const hospital = await Hospital.findByIdAndUpdate(req.params.hospitalId, { status, suspensionReason: status === "suspended" ? suspensionReason || "Suspended by platform administrator" : "" }, { new: true, runValidators: true });
  if (!hospital) throw new AppError("Hospital not found", 404);
  if (status === "suspended" && global.io) global.io.to(`hospital:${hospital._id}`).emit("workspace:suspended", { message: "This hospital workspace has been suspended" });
  res.json({ success: true, data: hospital });
});

exports.updateSubscription = asyncHandler(async (req, res) => {
  const { plan, status, expiresAt } = req.body || {};
  const hospital = await Hospital.findById(req.params.hospitalId);
  if (!hospital) throw new AppError("Hospital not found", 404);
  if (plan && !["trial", "basic", "professional", "enterprise"].includes(plan)) throw new AppError("Invalid plan", 400);
  if (status && !["trial", "active", "expired", "cancelled"].includes(status)) throw new AppError("Invalid subscription status", 400);
  if (plan) hospital.subscription.plan = plan;
  if (status) hospital.subscription.status = status;
  if (expiresAt) hospital.subscription.expiresAt = new Date(expiresAt);
  await hospital.save();
  res.json({ success: true, data: hospital });
});
