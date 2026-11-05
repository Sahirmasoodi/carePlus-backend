const router = require("express").Router();
const { allowRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/appointmentController");
router.get("/", allowRoles("admin", "doctor", "patient"), controller.listAppointments);
router.post("/", allowRoles("patient"), controller.createAppointment);
router.patch("/:appointmentId", allowRoles("admin", "doctor", "patient"), controller.updateAppointment);
module.exports = router;
