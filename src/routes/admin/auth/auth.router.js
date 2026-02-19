const router = require("express").Router();
const authController = require("../../../controllers/admin/auth/auth.controller.js");
const { validate } = require("../../../middelware/validate.middleware.js");
const verifyToken = require("../../../middelware/verifyToken.js");
const { adminLoginSchema, forgotPasswordSchema, verifyOtpForForgotPasswordSchema, resetPasswordSchema } = require("../../../validations/auth.validation");

router.post("/login", validate(adminLoginSchema), authController.login);

router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-otp", validate(verifyOtpForForgotPasswordSchema), authController.verifyOtp);
router.post("/reset-password", validate(resetPasswordSchema), verifyToken, authController.resetPassword);

module.exports = router;