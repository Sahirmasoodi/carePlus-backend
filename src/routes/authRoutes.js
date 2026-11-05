const router = require("express").Router();
const controller = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
router.post("/login", controller.login);
router.post("/signup/patient", controller.signupPatient);
router.get("/me", protect, controller.me);
router.post("/logout", controller.logout);
module.exports = router;
