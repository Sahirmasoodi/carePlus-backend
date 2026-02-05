const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentStartTime: {
      type: Date,
    },
    appointmentEndTime: {
      type: Date,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    consultationType: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    meetingLink: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
module.exports = AppointmentModel;
