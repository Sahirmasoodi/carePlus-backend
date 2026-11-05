const mongoose = require("mongoose");
const conversationSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true, index: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });
conversationSchema.index({ hospital: 1, participants: 1 });
module.exports = mongoose.model("Conversation", conversationSchema);
