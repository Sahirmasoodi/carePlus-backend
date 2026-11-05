const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");
const { validatePrescriptionInput } = require("../validators/prescriptionValidator");
const hospitalId = (req) => req.hospital._id;
exports.listPrescriptions = asyncHandler(async (req, res) => {
  const filter = { hospital: hospitalId(req) };
  if (req.user.role === "patient") filter.patient = req.user._id;
  if (req.user.role === "doctor") filter.doctor = req.user._id;
  const data = await Prescription.find(filter).sort({ publishedAt: -1 })
    .populate("doctor", "firstName lastName specialization").populate("patient", "firstName lastName")
    .populate("appointment", "startAt status");
  res.json({ success: true, data });
});

exports.createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, diagnosis, medicines, clinicalNotes, advice, followUpDate } = req.body || {};
  validatePrescriptionInput({ appointmentId, diagnosis, medicines });
  const appointment = await Appointment.findOne({ _id: appointmentId, hospital: hospitalId(req), doctor: req.user._id, status: { $in: ["confirmed", "completed"] } });
  if (!appointment) throw new AppError("A prescription can only be issued for your confirmed or completed appointment", 403);
  const existing = await Prescription.findOne({ appointment: appointment._id });
  if (existing) throw new AppError("A prescription already exists for this appointment", 409);
  const prescription = await Prescription.create({
    hospital: hospitalId(req), appointment: appointment._id, patient: appointment.patient, doctor: req.user._id,
    diagnosis, medicines, clinicalNotes, advice, followUpDate: followUpDate || undefined
  });
  await createNotification({ hospital: hospitalId(req), recipient: appointment.patient, type: "prescription", title: "Your prescription is ready", body: "Your doctor has published a prescription", resourceId: prescription._id });
  res.status(201).json({ success: true, data: prescription });
});