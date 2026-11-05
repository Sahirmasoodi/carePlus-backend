const mongoose = require("mongoose");
const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: String
}, { _id: false });
const prescriptionSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  diagnosis: { type: String, required: true, trim: true, maxlength: 2000 },
  medicines: { type: [medicineSchema], validate: v => v.length > 0 },
  clinicalNotes: String,
  advice: String,
  followUpDate: Date,
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["published", "amended"], default: "published" }
}, { timestamps: true });
module.exports = mongoose.model("Prescription", prescriptionSchema);
