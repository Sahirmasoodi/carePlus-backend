const express = require("express");
const { userAuth } = require("../middleware");
const { catchMessage } = require("../utils/messages");
const { updateUservalidations } = require("../validations/user");
const userRouter = express.Router();

userRouter.get("/user/me", userAuth, async (req, res) => {
  const profile = req.user;
  try {
    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

userRouter.patch("/user/update", userAuth, async (req, res) => {
  const profile = req.user;
  try {
    await updateUservalidations(req.body)
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

userRouter.patch("/user/change-password", userAuth, async (req, res) => {
  const profile = req.user;
  try {
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

module.exports = { userRouter };
