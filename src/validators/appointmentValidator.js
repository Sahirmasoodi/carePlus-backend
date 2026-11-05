const AppError = require("../utils/AppError");
function validateAppointmentInput({ doctor, startAt, endAt }) {
  const start = new Date(startAt), end = new Date(endAt);
  if (!doctor || !startAt || !endAt || Number.isNaN(+start) || Number.isNaN(+end) || start <= new Date() || end <= start) {
    throw new AppError("Choose a valid future appointment time", 400);
  }
  if (end - start > 120 * 60000) throw new AppError("Appointment duration cannot exceed two hours", 400);
  return { start, end };
}
function validateAppointmentStatus(status) {
  if (!["pending", "confirmed", "completed", "cancelled", "no_show"].includes(status)) throw new AppError("Invalid appointment status", 400);
}
module.exports = { validateAppointmentInput, validateAppointmentStatus };
