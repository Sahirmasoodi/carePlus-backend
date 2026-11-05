const updateUservalidations = async (body) => {
  const {
    firstName,
    lastName,
    specialization,
    department,
    qualification,
    experience,
    licenseNumber,
    age,
    phone,
    gender,
    isAvailable,
    availableDays,
    availableTime,
  } = body;

  const allowedFields = [
    "firstName",
    "lastName",
    "specialization",
    "department",
    "qualification",
    "experience",
    "licenseNumber",
    "age",
    "phone",
    "gender",
    "isAvailable",
    "availableDays",
    "availableTime",
  ];

  const isValidRequest = Object.keys(body).every((k) =>
    allowedFields.includes(k)
  );
  if (!isValidRequest) {
    throw new AppError("Bad Request", 400);
  }
  
};
module.exports = { updateUservalidations };
