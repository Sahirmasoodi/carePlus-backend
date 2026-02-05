const mongoose = require("mongoose");
const url ="mongodb+srv://sahirmasoodi:sahir.masoodi@cluster0.ud2xzea.mongodb.net/careplus";

const connectDB = async () => {
  await mongoose.connect(url);
};

module.exports = {connectDB}