const router = require("express").Router();
const { allowRoles } = require("../middleware/authMiddleware");
const controller = require("../controllers/peopleController");
router.get("/people", allowRoles("admin"), controller.listPeople);
router.post("/people", allowRoles("admin"), controller.createPerson);
router.patch("/people/:userId/status", allowRoles("admin"), controller.updatePersonStatus);
router.get("/doctors", allowRoles("patient", "admin"), controller.listDoctors);
module.exports = router;
