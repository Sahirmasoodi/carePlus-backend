const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is required");
  await mongoose.connect(process.env.MONGO_URL);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
module.exports = connectDB;
