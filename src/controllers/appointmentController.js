const User = require("../models/User");
const Appointment = require("../models/Appointment");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");
const { validateAppointmentInput, validateAppointmentStatus } = require("../validators/appointmentValidator");
const hospitalId = (req) => req.hospital._id;
exports.listAppointments = asyncHandler(async (req, res) => {
  const filter = { hospital: hospitalId(req) };
  if (req.user.role === "doctor") filter.doctor = req.user._id;
  if (req.user.role === "patient") filter.patient = req.user._id;
  const data = await Appointment.find(filter).sort({ startAt: -1 }).limit(300)
    .populate("doctor", "firstName lastName specialization").populate("patient", "firstName lastName");
  res.json({ success: true, data });
});

exports.createAppointment = asyncHandler(async (req, res) => {
  if (req.user.role !== "patient") throw new AppError("Only patients can request appointments", 403);
  const { doctor, startAt, endAt, reason, consultationType } = req.body || {};
  const { start, end } = validateAppointmentInput({ doctor, startAt, endAt });
  const doctorUser = await User.findOne({ _id: doctor, hospital: hospitalId(req), role: "doctor", isActive: true });
  if (!doctorUser) throw new AppError("Choose a doctor from your selected hospital", 404);
  const conflict = await Appointment.findOne({ hospital: hospitalId(req), doctor, status: { $in: ["pending", "confirmed"] }, startAt: { $lt: end }, endAt: { $gt: start } });
  if (conflict) throw new AppError("That time slot is no longer available. Choose another time", 409);
  const appointment = await Appointment.create({ hospital: hospitalId(req), patient: req.user._id, doctor, startAt: start, endAt: end, reason, consultationType: consultationType || "offline", createdBy: req.user._id });
  await createNotification({ hospital: hospitalId(req), recipient: doctor, type: "appointment", title: "New appointment request", body: `${req.user.firstName} requested an appointment`, resourceId: appointment._id });
  res.status(201).json({ success: true, data: appointment });
});

exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.appointmentId, hospital: hospitalId(req) });
  if (!appointment) throw new AppError("Appointment not found", 404);
  const { status, cancellationReason } = req.body || {};
  validateAppointmentStatus(status);
  const isDoctor = req.user.role === "doctor" && String(appointment.doctor) === String(req.user._id);
  const isPatient = req.user.role === "patient" && String(appointment.patient) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isDoctor && !isPatient && !isAdmin) throw new AppError("You cannot update this appointment", 403);
  const allowed = isDoctor ? ["confirmed", "completed", "cancelled", "no_show"] : isPatient ? ["cancelled"] : ["confirmed", "cancelled", "completed", "no_show"];
  if (!allowed.includes(status)) throw new AppError("This status change is not permitted", 403);
  if (status === "completed" && appointment.status !== "confirmed") throw new AppError("Only confirmed appointments can be completed", 400);
  appointment.status = status;
  if (status === "cancelled") appointment.cancellationReason = cancellationReason || "Cancelled";
  await appointment.save();
  const recipient = isPatient ? appointment.doctor : appointment.patient;
  await createNotification({ hospital: hospitalId(req), recipient, type: "appointment", title: "Appointment updated", body: `Appointment status changed to ${status}`, resourceId: appointment._id });
  res.json({ success: true, data: appointment });
});