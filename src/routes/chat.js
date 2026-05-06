const express = require("express");
const { userAuth } = require("../middleware");
const ChatModel = require("../model/chatModel");
const chatRouter = express.Router();

chatRouter.get("/:toUserId", userAuth, async (req, res) => {
  try {
    const { toUserId } = req.params;
    const user = req.user;
    const chats = await ChatModel.findOne({
      participants: { $all: [user._id, toUserId] },
    }).populate("participants" ,"firstName lastName")
    res.send(chats)
  } catch (error) {
    res.send(error)

  }
});

module.exports = { chatRouter };
