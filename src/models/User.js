const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null, index: true },
  role: { type: String, enum: ["superadmin", "admin", "doctor", "patient"], required: true, index: true },
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, trim: true, default: "", maxlength: 60 },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: String,
  profileImage: String,
  gender: { type: String, enum: ["male", "female", "other", "prefer-not-to-say"] },
  dateOfBirth: Date,
  specialization: String,
  department: String,
  qualification: String,
  licenseNumber: String,
  experience: Number,
  bio: String,
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  lastLoginAt: Date
}, { timestamps: true, toJSON: { transform(doc, ret) { delete ret.password; delete ret.__v; return ret; } } });
userSchema.index({ hospital: 1, email: 1 }, { unique: true, partialFilterExpression: { hospital: { $type: "objectId" } } });
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { hospital: { $type: "null" } } });
userSchema.methods.comparePassword = function (candidate) { return bcrypt.compare(candidate, this.password); };
userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);
module.exports = mongoose.model("User", userSchema);
