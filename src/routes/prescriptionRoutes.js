const router = require("express").Router();
const { allowRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/prescriptionController");
router.get("/", allowRoles("doctor", "patient"), controller.listPrescriptions);
router.post("/", allowRoles("doctor"), controller.createPrescription);
module.exports = router;
