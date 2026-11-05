const AppError = require("../utils/AppError");
function validatePrescriptionInput({ appointmentId, diagnosis, medicines }) {
  if (!appointmentId || !diagnosis || !Array.isArray(medicines) || !medicines.length) {
    throw new AppError("Appointment, diagnosis and at least one medicine are required", 400);
  }
  for (const medicine of medicines) {
    if (!medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
      throw new AppError("Every medicine needs a name, dosage, frequency and duration", 400);
    }
  }
}
module.exports = { validatePrescriptionInput };
