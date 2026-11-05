const jwt = require("jsonwebtoken");
const UserModel = require("./model/userModel");
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      throw new Error("Not authenticated");
    }
    const { id } = await jwt.verify(token, "Sahir@12345");
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.send({
      success: false,
      data: error.message || "Something went wrong",
    });
  }
};

module.exports = { userAuth };
