const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["appointment", "prescription", "message", "system"], default: "system" },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  resourceId: mongoose.Schema.Types.ObjectId,
  readAt: Date
}, { timestamps: true });
module.exports = mongoose.model("Notification", notificationSchema);
