const mongoose = require("mongoose");

const appointmentTimeSchema = new mongoose.Schema(
  {
    appointmentStartTime: {
      type: Date
    },
    appointmentEndTime: {
      type: Date
    },
  }
);

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

   appointmentTime: [appointmentTimeSchema],

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
  { timestamps: true },
);

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
module.exports = AppointmentModel;
