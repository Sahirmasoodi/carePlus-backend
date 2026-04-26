const express = require("express");
const { connectDB } = require("./config/database");
// const { validateUser } = require("./utils/validation");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/auth");
const { appointmentRouter } = require("./routes/appointments");
const { userRouter } = require("./routes/user");
const { publicRouter } = require("./routes/public");
const dotenv = require("dotenv");
const cors = require("cors");
const handleSocket = require("./utils/socket");
const http = require("http");
const { patientRouter } = require("./routes/patient");

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [
      "http://51.20.44.129",
      "http://localhost:5173",
      "https://docprescripto.netlify.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const server = http.createServer(app);
handleSocket(server);

app.use("/", authRouter);
app.use("/", appointmentRouter);
app.use("/", userRouter);
app.use("/public", publicRouter);
app.use("/patient", patientRouter);

const PORT = process.env.PORT || 3333;
connectDB()
  .then(() => {
    console.log("Connected Db Successfully");
    server.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
  console.error("DB Connection Error:", err);
    console.log("Connection failed on Port 3333");
  });


