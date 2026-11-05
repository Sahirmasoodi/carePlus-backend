const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const hospitalId = (req) => req.hospital._id;
exports.notifications = asyncHandler(async (req, res) => {
  const data = await Notification.find({ hospital: hospitalId(req), recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data });
});
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.notificationId, hospital: hospitalId(req), recipient: req.user._id }, { readAt: new Date() }, { new: true });
  if (!item) throw new AppError("Notification not found", 404);
  res.json({ success: true, data: item });
});