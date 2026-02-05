const { Router } = require("express");
const { AppError, catchMessage } = require("../utils/messages");
const UserModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signupValidations } = require("../validations/auth");
const { userAuth } = require("../middleware");

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
//  if (!req.body) {
//   //  res.status(400).send({ success: false, data: "Bad Request" });
//    return
//  }
  
  const { email, password } = req.body || {};

  try {
    if (!email || !password) {
      throw new AppError("Bad Request", 400);
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("Inavlid Credentials", 404);
    }
    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      throw new AppError("Inavlid Credentials", 404);
    }
    const token = await jwt.sign({ id: user?._id }, "Sahir@12345", {
      expiresIn: "1d",
    });
    const refreshToken = await jwt.sign({ id: user?._id }, "Sahir@12345", {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

authRouter.post("/signup", async (req, res) => {
  let { password } = req.body || {};
  try {
    await signupValidations(req.body);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel({
      ...req.body,
      password: passwordHash,
    });
    await user.save();
    res.status(201).send({ success: true, data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

authRouter.post("/logout", (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.status(200).json({ success: true, data: "Logged out successfully." });
});

authRouter.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.cookies;
  try {
    if (!refreshToken) {
      throw new AppError("Please Login Again", 404);
    }
    const { id } = await jwt.verify(refreshToken, "Sahir@12345");
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const token = await jwt.sign({ id: user._id }, "Sahir@12345", {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, data: "Logged in successfully." });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(catchMessage(false, error));
  }
});

module.exports = { authRouter };
