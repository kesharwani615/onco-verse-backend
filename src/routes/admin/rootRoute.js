const router = require("express").Router();
const authRouter = require("../admin/auth/auth.router.js");
const patientRouter = require("../admin/patient/patient.route.js")

// Admin routes will be added here
router.use("/admin/auth", authRouter);

router.use("/admin/patient",patientRouter)

module.exports = router;
