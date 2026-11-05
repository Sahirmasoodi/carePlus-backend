const validator = require("validator");
const UserModel = require("../model/userModel");
const { AppError } = require("../utils/messages");

const signupValidations = async (data) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    specialization,
    department,
    qualification,
    experience,
    licenseNumber,
    age,
    phone,
    profileImage,
    gender,
    isAvailable,
    availableDays,
    availableTime,
  } = data || {};
  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "role",
    "specialization",
    "department",
    "qualification",
    "experience",
    "licenseNumber",
    "age",
    "phone",
    "profileImage",
    "gender",
    "isAvailable",
    "availableDays",
    "availableTime",
  ];
console.log(data);

  const isValidRequest = Object.keys(data).every((key) =>
    allowedFields.includes(key),
  );
  if (!isValidRequest) {
    throw new AppError("Bad Request", 400);
  }
  if (!firstName || !email || !password || !role || !gender) {
    throw new AppError("Bad Request", 400);
  }
  if (!validator.isEmail(email)) {
    throw new AppError("Invalid Email", 400);
  }
  if (!validator.isStrongPassword(password)) {
    throw new AppError("Use storng password", 400);
  }
  const user = await UserModel.findOne({ email });
  if (user) {
    throw new AppError("Use Different Email", 409);
  }
  if (availableDays && !availableDays.every((k) =>
      ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(k),
    )
  ) {
    throw new AppError(
      "Invalid availableDays value. Allowed values are: MON, TUE, WED, THU, FRI, SAT, SUN.",
      400,
    );
  }
};

module.exports = { signupValidations };
