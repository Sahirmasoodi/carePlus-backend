const Hospital = require("../models/Hospital");
const asyncHandler = require("../utils/asyncHandler");
exports.listHospitals = asyncHandler(async (req, res) => {
  const now = new Date();
  const hospitals = await Hospital.find({
    status: "active",
    $or: [
      { "subscription.status": { $in: ["active", "trial"] }, $or: [{ "subscription.expiresAt": null }, { "subscription.expiresAt": { $gt: now } }] },
      { "subscription.status": { $exists: false } }
    ]
  }).select("name slug city address logo").sort({ name: 1 });
  res.json({ success: true, data: hospitals });
});
exports.getHospital = asyncHandler(async (req, res) => {
  const now = new Date();
  const hospital = await Hospital.findOne({
    slug: req.params.slug, status: "active",
    "subscription.status": { $in: ["active", "trial"] },
    $or: [{ "subscription.expiresAt": null }, { "subscription.expiresAt": { $gt: now } }]
  }).select("name slug city address logo settings");
  if (!hospital) return res.status(404).json({ success: false, error: "Hospital not found" });
  res.json({ success: true, data: hospital });
});
