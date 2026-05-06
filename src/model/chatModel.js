const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    fullName: {
      type: String,
    },
    time: {
      type: Date,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true },
);
const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ],
  messages: [messageSchema],
});
const ChatModel = mongoose.model("Chat", chatSchema);
module.exports = ChatModel;
