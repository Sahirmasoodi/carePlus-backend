const mongoose = require("mongoose");
const subscriptionSchema = new mongoose.Schema({
  plan: { type: String, enum: ["trial", "basic", "professional", "enterprise"], default: "trial" },
  status: { type: String, enum: ["trial", "active", "expired", "cancelled"], default: "trial" },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  paymentReference: String
}, { _id: false });
const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  address: String,
  city: String,
  logo: String,
  timezone: { type: String, default: "Asia/Kolkata" },
  status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
  suspensionReason: String,
  subscription: { type: subscriptionSchema, default: () => ({}) },
  settings: {
    allowPatientSignup: { type: Boolean, default: true },
    appointmentDurationMinutes: { type: Number, default: 30 }
  }
}, { timestamps: true });
hospitalSchema.index({ name: "text", city: "text" });
module.exports = mongoose.model("Hospital", hospitalSchema);
