const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  reason: { type: String, trim: true, maxlength: 1000 },
  consultationType: { type: String, enum: ["online", "offline"], default: "offline" },
  meetingLink: String,
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled", "no_show"], default: "pending", index: true },
  cancellationReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
appointmentSchema.index({ hospital: 1, doctor: 1, startAt: 1 });
module.exports = mongoose.model("Appointment", appointmentSchema);
