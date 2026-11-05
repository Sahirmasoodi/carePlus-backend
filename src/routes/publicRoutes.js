const router = require("express").Router();
const controller = require("../controllers/publicController");
router.get("/hospitals", controller.listHospitals);
router.get("/hospitals/:slug", controller.getHospital);
module.exports = router;
