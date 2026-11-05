const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(x => x.trim()), credentials: true },
    transports: ["websocket", "polling"]
  });
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.careplus_token || socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user || !user.isActive) return next(new Error("Account unavailable"));
      if (user.role !== "superadmin") {
        const hospital = await Hospital.findById(user.hospital);
        if (!hospital || hospital.status !== "active" || ["expired", "cancelled"].includes(hospital.subscription.status) || (hospital.subscription.expiresAt && new Date(hospital.subscription.expiresAt) <= new Date())) return next(new Error("Hospital workspace unavailable"));
        socket.data.hospitalId = String(hospital._id);
        socket.join(`hospital:${hospital._id}`);
      }
      socket.data.userId = String(user._id);
      socket.data.role = user.role;
      next();
    } catch { next(new Error("Invalid session")); }
  });
  io.on("connection", socket => {
    socket.join(`user:${socket.data.userId}`);
    socket.emit("socket:ready", { connected: true });
  });
  global.io = io;
  return io;
}
module.exports = attachSocketServer;
