const AppointmentModel = require("../model/appointmentModel");
const UserModel = require("../model/userModel");
const { AppError } = require("../utils/messages");
const validator = require("validator");

const isDoctorValid = async (doctor) => {
  const isDoctorPresent = await UserModel.findOne({
    _id: doctor,
    role: "doctor",
  });
  if (!isDoctorPresent) {
    throw new AppError("Invalid doctor details provided", 400);
  }
};

const appointmentTimeValidation = async (
  appointmentStartTime,
  appointmentEndTime,
  doctor,
) => {
  const startTime = new Date(appointmentStartTime);
  const endTime = new Date(appointmentEndTime);
  const isAppointmentValid = await AppointmentModel.findOne({
    doctor,
    status: { $ne: "cancelled" },
    appointmentTime: {
      $elemMatch: {
        appointmentStartTime: { $lt: endTime },
        appointmentEndTime: { $gt: startTime },
      },
    },
  });
  if (isAppointmentValid) {
    throw new AppError("Selected time slot is already booked", 409);
  }

  if (startTime > endTime) {
    throw new AppError("Start time must be before the end time", 400);
  }

  const maxAppointmentTime = (endTime - startTime) / (1000 * 60);
  if (maxAppointmentTime > 120) {
    throw new AppError("Appointment duration cannot exceed 120 minutes", 400);
  }
};
const appointmentValidations = async (data) => {
  const {
    patient,
    doctor,
    reason,
    consultationType,
    meetingLink,
    appointmentTime,
    status,
  } = data;
  const allowedFields = [
    "patient",
    "doctor",
    "reason",
    "consultationType",
    "meetingLink",
    "status",
    "appointmentTime",
  ];

  const isValidRequest = Object.keys(data).every((key) =>
    allowedFields.includes(key),
  );
  if (!isValidRequest) {
    throw new AppError("Bad Request", 400);
  }
  if (!patient || !doctor || !status || !appointmentTime) {
    throw new AppError("Missing required fields", 400);
  }

  const isPatientValid = await UserModel.findOne({
    _id: patient,
    role: "patient",
  });
  if (!isPatientValid) {
    throw new AppError("Invalid patient details provided", 400);
  }
  await isDoctorValid(doctor);

  if (doctor.toString() === patient.toString()) {
    throw new AppError("Bad Request", 400);
  }
  await appointmentTimeValidation(
    appointmentTime.appointmentStartTime,
    appointmentTime.appointmentEndTime,
    doctor,
  );
  //   if (consultationType == "online" && !meetingLink) {
  //     throw new AppError("Meeting Link is required for online mode", 400);
  //   }

  if (meetingLink && !validator.isURL(meetingLink)) {
    throw new AppError("Invalid Meeting Link", 400);
  }
};

const updateAppointmentValidations = async (params, body) => {
  const { appointmentId } = params;
  const {
    appointmentStartTime,
    appointmentEndTime,
    consultationType,
    meetingLink,
    status,
    doctor,
    reason,
  } = body;
  const allowedFields = [
    "doctor",
    "reason",
    "consultationType",
    "meetingLink",
    "status",
    "appointmentStartTime",
    "appointmentEndTime",
  ];

  const isValidRequest = Object.keys(body).every((k) =>
    allowedFields.includes(k),
  );
  if (!isValidRequest) {
    throw new AppError("Bad Request", 400);
  }
  const isAppointmentValid = await AppointmentModel.findById(appointmentId);

  if (!isAppointmentValid) {
    throw new AppError("Appointment not found.", 404);
  }

  if (doctor) {
    await isDoctorValid(doctor);
  }
  console.log(isAppointmentValid.doctor);

  if (
    appointmentStartTime &&
    appointmentEndTime &&
    (doctor || isAppointmentValid.doctor)
  ) {
    await appointmentTimeValidation(
      appointmentStartTime,
      appointmentEndTime,
      doctor || isAppointmentValid.doctor,
    );
  }
  return isAppointmentValid;
};

module.exports = { appointmentValidations, updateAppointmentValidations };
