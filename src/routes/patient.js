const express = require("express");
const { catchMessage } = require("../utils/messages");
const UserModel = require("../model/userModel");

const patientRouter = express.Router();

patientRouter.get("/doctors/all", async (req, res) => {
  try {
    const doctors = await UserModel.find({ role: "doctor" });
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

module.exports = { patientRouter };
