const express = require("express");
const { userAuth } = require("../middleware");
const { catchMessage, AppError } = require("../utils/messages");
const { updateUservalidations } = require("../validations/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const UserModel = require("../model/userModel");
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
  const user = req.user;
  try {
    await updateUservalidations(req.body);
    const updatedUser = await UserModel.findByIdAndUpdate(user._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

userRouter.patch("/user/change-password", userAuth, async (req, res) => {
  const userId = req.user._id;
  try {
    const { newPassword, oldPassword } = req.body;
    if (!newPassword || !oldPassword) {
      throw new AppError("Old and new password are required", 400);
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new AppError("Use Strong Password", 400);
    }
    if (newPassword == oldPassword) {
      throw new AppError("Cannot use same password", 400);
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      throw new AppError("Old password is incorrect", 400);
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({
      success: true,
      data: "Password Updated Successfully",
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

module.exports = { userRouter };
