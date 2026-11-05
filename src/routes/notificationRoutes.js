const router = require("express").Router();
const controller = require("../controllers/notificationController");
router.get("/", controller.notifications);
router.patch("/:notificationId/read", controller.markNotificationRead);
module.exports = router;
