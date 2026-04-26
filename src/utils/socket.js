const socket = require("socket.io");
const handleSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://51.20.44.129", "http://localhost:5173"],
    },
  });
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("joinChat", ({ data }) => {
      console.log(data);
    });
    socket.on("senMessage", () => {});
  });
};
module.exports = handleSocket;
