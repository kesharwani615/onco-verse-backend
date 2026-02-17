const router = require("express").Router();
const authController = require("../../../controllers/mobile/auth/authController");
const { validate } = require("../../../middelware/validate.middleware");
const verifyToken = require("../../../middelware/verifyToken");
const { registerUserSchema, verifyOtpSchema, setPasswordSchema, loginSchema, verifyOtpForLoginSchema, completeProfileSchema } = require("../../../validations/auth.validation");

// Register User Route
router.post("/register", validate(registerUserSchema), authController.registerUser);

router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

router.post("/set-password", validate(setPasswordSchema), verifyToken, authController.setPassword);

router.post("/login", validate(loginSchema), authController.login);

router.post("/verify-otp-login", validate(verifyOtpForLoginSchema), authController.verifyOtpForLogin);

// Complete Profile Route
router.post(
    "/complete-profile", 
    verifyToken, 
    validate(completeProfileSchema), 
    authController.completeProfile
  );

module.exports = router;