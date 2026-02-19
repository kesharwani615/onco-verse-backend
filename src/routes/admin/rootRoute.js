const router = require("express").Router();
const authRouter = require("../admin/auth/auth.router.js");

// Admin routes will be added here
router.use("/admin/auth", authRouter);

module.exports = router;
