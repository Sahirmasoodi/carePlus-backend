const socket = require("socket.io");
const ChatModel = require("../model/chatModel");
const handleSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://51.20.44.129", "http://localhost:5173"],
    },
  });
  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);
    socket.on("joinChat", ({ senderId, recieverId }) => {
      const roomId = [senderId, recieverId].sort().join("_");
      console.log("roomId", roomId);

      socket.join(roomId);
    });
    socket.on("sendMessage", async ({ senderId, recieverId, text }) => {
      try {
        const roomId = [senderId, recieverId].sort().join("_");
        let chat = await ChatModel.findOne({
          participants: { $all: [senderId, recieverId] },
        });

        if (!chat) {
          chat = await new ChatModel({
            participants: [senderId, recieverId],
            messages: [text],
          });
        }
        chat.messages.push(text);
        await chat.save();
        io.to(roomId).emit("messageRecieved", { messageData: text });
      } catch (error) {
        console.log(error.message);
      }
    });
  });
};
module.exports = handleSocket;
