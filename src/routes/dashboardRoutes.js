const router = require("express").Router();
const { allowRoles } = require("../middleware/authMiddleware");
const { dashboard } = require("../controllers/dashboardController");
router.get("/dashboard", allowRoles("admin", "doctor", "patient"), dashboard);
module.exports = router;
