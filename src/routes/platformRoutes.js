const router = require("express").Router();
const controller = require("../controllers/platformController");
const { protect, allowRoles } = require("../middleware/authMiddleware");
router.use(protect, allowRoles("superadmin"));
router.get("/overview", controller.overview);
router.route("/hospitals").get(controller.listHospitals).post(controller.createHospital);
router.patch("/hospitals/:hospitalId/status", controller.updateHospitalStatus);
router.patch("/hospitals/:hospitalId/subscription", controller.updateSubscription);
module.exports = router;
