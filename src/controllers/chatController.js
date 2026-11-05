const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");
const hospitalId = (req) => req.hospital._id;
exports.listConversations = asyncHandler(async (req, res) => {
  const data = await Conversation.find({ hospital: hospitalId(req), participants: req.user._id })
    .populate("participants", "firstName lastName role specialization").sort({ lastMessageAt: -1 });
  res.json({ success: true, data });
});

async function getOrCreateConversation(req, otherId) {
  const other = await User.findOne({ _id: otherId, hospital: hospitalId(req), role: { $in: ["doctor", "patient"] }, isActive: true });
  if (!other) throw new AppError("Care contact not found in this hospital", 404);
  const appointment = await Appointment.findOne({
    hospital: hospitalId(req), status: { $in: ["confirmed", "completed"] },
    $or: [{ doctor: req.user._id, patient: otherId }, { doctor: otherId, patient: req.user._id }]
  });
  if (!appointment) throw new AppError("Messaging is available after an appointment is confirmed", 403);
  let conversation = await Conversation.findOne({ hospital: hospitalId(req), participants: { $all: [req.user._id, otherId], $size: 2 } });
  if (!conversation) conversation = await Conversation.create({ hospital: hospitalId(req), participants: [req.user._id, otherId], appointment: appointment._id });
  return conversation;
}
exports.getMessages = asyncHandler(async (req, res) => {
  const conversation = await getOrCreateConversation(req, req.params.userId);
  const messages = await Message.find({ conversation: conversation._id, hospital: hospitalId(req) }).sort({ createdAt: 1 }).limit(500).populate("sender", "firstName lastName role");
  res.json({ success: true, data: { conversation, messages } });
});
exports.sendMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text || text.length > 4000) throw new AppError("Message must be between 1 and 4000 characters", 400);
  const conversation = await getOrCreateConversation(req, req.params.userId);
  const message = await Message.create({ hospital: hospitalId(req), conversation: conversation._id, sender: req.user._id, text });
  conversation.lastMessageAt = new Date();
  await conversation.save();
  const populated = await message.populate("sender", "firstName lastName role");
  const io = global.io;
  if (io) {
    io.to(`user:${req.params.userId}`).emit("chat:message", { message: populated, conversationId: conversation._id });
  }
  await createNotification({ hospital: hospitalId(req), recipient: req.params.userId, type: "message", title: "New care message", body: `${req.user.firstName} sent you a message`, resourceId: conversation._id });
  res.status(201).json({ success: true, data: populated });
});