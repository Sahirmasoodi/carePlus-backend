const express = require("express");
const { userAuth } = require("../middleware");
const {
  appointmentValidations,
  updateAppointmentValidations,
} = require("../validations/appointment");
const { catchMessage, AppError } = require("../utils/messages");
const AppointmentModel = require("../model/appointmentModel");
const appointmentRouter = express.Router();

appointmentRouter.post("/appointment/create", userAuth, async (req, res) => {
  try {
    await appointmentValidations(req.body);
    const appointment = await AppointmentModel({
      ...req.body,
    });
    await appointment.save();
    await appointment.populate([
      { path: "doctor", select: "firstName lastName" },
      { path: "patient", select: "firstName lastName" },
    ]);
    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

appointmentRouter.patch(
  "/appointment/update/:appointmentId",
  userAuth,
  async (req, res) => {
    const { appointmentId } = req.params;
    const {
      appointmentStartTime,
      appointmentEndTime,
      consultationType,
      meetingLink,
      status,
      doctor,
      reason,
    } = req.body;
    try {
      const appointment = await updateAppointmentValidations(
        req.params,
        req.body,
      );

      const updatedAppointment = {};
      if (appointmentStartTime)
        updatedAppointment.appointmentStartTime = appointmentStartTime;
      if (appointmentEndTime)
        updatedAppointment.appointmentEndTime = appointmentEndTime;
      if (consultationType)
        updatedAppointment.consultationType = consultationType;
      if (meetingLink) updatedAppointment.meetingLink = meetingLink;
      if (status) updatedAppointment.status = status;
      if (doctor) updatedAppointment.doctor = doctor;
      if (reason) updatedAppointment.reason = reason;
      const patchAppointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        updatedAppointment,
        { runValidators: true, new: true },
      ).populate([
        { path: "doctor", select: "firstName lastName" },
        { path: "patient", select: "firstName lastName" },
      ]);
      res.status(200).json({
        success: true,
        data: patchAppointment,
      });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json(catchMessage(false, error));
    }
  },
);

appointmentRouter.delete(
  "/appointment/delete/:appointmentId",
  userAuth,
  async (req, res) => {
    const { appointmentId } = req.params;
    try {
      const deleteAppointment =
        await AppointmentModel.findByIdAndDelete(appointmentId);
      if (!deleteAppointment) {
        throw new AppError("Appointment not found", 404);
      }
      res.status(204).send();
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json(catchMessage(false, error));
    }
  },
);

appointmentRouter.get("/appointments/my", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new AppError("User not found", 404);
    }
    let myAppointments;
    if (req.user.role == "doctor") {
      myAppointments = await AppointmentModel.find({
        doctor: userId,
      }).populate("doctor patient", "firstName lastName");
    } else if (req.user.role == "patient") {
      myAppointments = await AppointmentModel.find({
        patient: userId,
      }).populate("doctor patient", "firstName lastName");
    }

    res.status(200).json({
      success: true,
      data: myAppointments,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

appointmentRouter.get("/appointments/all", userAuth, async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") {
      throw new AppError("Forbidden", 403);
    }
    const allAppointments = await AppointmentModel.find();
    res.status(200).json({
      success: true,
      data: allAppointments,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});
module.exports = { appointmentRouter };
