const express = require("express");
const { catchMessage } = require("../utils/messages");
const UserModel = require("../model/userModel");

const publicRouter = express.Router();

publicRouter.get("/doctors/home", async (req, res) => {
  try {
    const doctors = await UserModel.find({ role: "doctor" }).limit(6);
        res.status(200).json({ success: true, data: doctors });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

module.exports = { publicRouter };
