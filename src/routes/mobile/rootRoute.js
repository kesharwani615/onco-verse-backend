const router =  require("express").Router();

const authRoutes = require("./auth/authRoutes");

router.use(authRoutes);

module.exports = router;