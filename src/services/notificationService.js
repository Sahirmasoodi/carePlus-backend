const Notification = require("../models/Notification");
async function createNotification({ hospital, recipient, type, title, body, resourceId }) {
  const notification = await Notification.create({ hospital, recipient, type, title, body, resourceId });
  const io = global.io;
  if (io) io.to(`user:${recipient}`).emit("notification:new", notification);
  return notification;
}
module.exports = { createNotification };
