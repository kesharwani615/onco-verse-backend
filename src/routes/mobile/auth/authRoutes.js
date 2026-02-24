const router = require("express").Router();
const authController = require("../../../controllers/mobile/auth/authController");
const { validate } = require("../../../middelware/validate.middleware");
const verifyToken = require("../../../middelware/verifyToken");
const { registerUserSchema, verifyOtpSchema, setPasswordSchema, loginSchema, verifyOtpForLoginSchema, completeProfileSchema, forgotPasswordSchema, verifyOtpForForgotPasswordSchema } = require("../../../validations/auth.validation");

// Register User Route
router.post("/register", validate(registerUserSchema), authController.registerUser);

router.post("/verify-otp", authController.verifyOtp);

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

router.post("/forgot-password",validate(forgotPasswordSchema), authController.forgotPassword);

router.post("/verify-otp-forgot-password", validate(verifyOtpForForgotPasswordSchema), authController.verifyOtpForForgotPassword);

router.get("/get-profile", verifyToken, authController.getProfile);

module.exports = router;