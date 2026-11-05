const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const asyncHandler = require("../utils/asyncHandler");
const hospitalId = (req) => req.hospital._id;
exports.dashboard = asyncHandler(async (req, res) => {
  const h = hospitalId(req), user = req.user;
  let appointmentFilter = { hospital: h };
  if (user.role === "doctor") appointmentFilter.doctor = user._id;
  if (user.role === "patient") appointmentFilter.patient = user._id;
  const [appointments, pending, completed, doctors, patients, prescriptions, recent] = await Promise.all([
    Appointment.countDocuments(appointmentFilter),
    Appointment.countDocuments({ ...appointmentFilter, status: "pending" }),
    Appointment.countDocuments({ ...appointmentFilter, status: "completed" }),
    User.countDocuments({ hospital: h, role: "doctor", isActive: true }),
    User.countDocuments({ hospital: h, role: "patient", isActive: true }),
    Prescription.countDocuments(user.role === "doctor" ? { hospital: h, doctor: user._id } : { hospital: h, patient: user._id }),
    Appointment.find(appointmentFilter).sort({ startAt: -1 }).limit(6).populate("doctor", "firstName lastName specialization").populate("patient", "firstName lastName")
  ]);
  res.json({ success: true, data: { appointments, pending, completed, doctors, patients, prescriptions, recent } });
});