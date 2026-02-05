const express = require("express");
const { connectDB } = require("./config/database");
// const { validateUser } = require("./utils/validation");
const cookieParser = require("cookie-parser");
const { authRouter } = require("./routes/auth");
const { appointmentRouter } = require("./routes/appointments");
const cors = require("cors")
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());


app.use("/", authRouter);
app.use("/", appointmentRouter);

connectDB()
  .then(() => {
    console.log("Connected Db Successfully");
    app.listen(3333, () => {
      console.log("Connection Successfull on Port 3333");
    });
  })
  .catch(() => {
    console.log("Db Server Down");
    console.log("Connection failed on Port 3333");
  });

// UnAISEeNNN7LAEtm
// mongodb+srv://sahirmasoodi:UnAISEeNNN7LAEtm@cluster1.phg9hkq.mongodb.net/
