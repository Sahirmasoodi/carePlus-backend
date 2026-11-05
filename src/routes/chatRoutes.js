const router = require("express").Router();
const { allowRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/chatController");
router.get("/", allowRoles("doctor", "patient"), controller.listConversations);
router.get("/:userId", allowRoles("doctor", "patient"), controller.getMessages);
router.post("/:userId/messages", allowRoles("doctor", "patient"), controller.sendMessage);
module.exports = router;
