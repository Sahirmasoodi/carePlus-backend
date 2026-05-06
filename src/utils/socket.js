const { Server } = require("socket.io");
const ChatModel = require("../model/chatModel");

const onlineUsers = new Map();

const handleSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://51.20.44.129", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ✅ 1. Register user (presence tracking)
    socket.on("register", (userId) => {
      socket.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId).add(socket.id);

      // broadcast user online
      io.emit("userOnline", { userId });
    });

    // ✅ 2. Join chat room
    socket.on("joinChat", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.join(roomId);
    });

    // ✅ 3. Send message
    socket.on("sendMessage", async ({ senderId, receiverId, messageData }) => {
      try {
        const roomId = [senderId, receiverId].sort().join("_");

        let chat = await ChatModel.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          chat = new ChatModel({
            participants: [senderId, receiverId],
            messages: [],
          });
        }

        chat.messages.push(messageData);
        await chat.save();

        // emit to room
        io.to(roomId).emit("messageReceived", {
          messageData,
          senderId,
        });
      } catch (error) {
        console.error("SendMessage Error:", error.message);
        socket.emit("errorMessage", {
          message: "Failed to send message",
        });
      }
    });

    // ✅ 4. Typing indicator (optional but production-level)
    socket.on("typing", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.to(roomId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      socket.to(roomId).emit("stopTyping", { senderId });
    });

    // ✅ 5. Disconnect handling (CRITICAL)
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const userId = socket.userId;
      if (!userId) return;

      const userSockets = onlineUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // broadcast offline
          io.emit("userOffline", { userId });
        }
      }
    });
  });

  return io;
};

module.exports = handleSocket;
