const adminModel = require("../../../models/admin/auth/admin.model");
const {catchAsyncError} = require("../../../middelware/catchAsyncError.js");
const response = require("../../../utilities/responseMsg.js");
const responseCode = require("../../../utilities/responseCode.js");
const service = require("../../../services/service.js");
const otpModel = require("../../../models/common/otp.model.js");
const bcrypt = require("bcryptjs");

exports.login = catchAsyncError(async (req, res) => {
    const { email, password } = req.body;
    const admin = await adminModel.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.NOT_FOUND,
            "Admin not found"
        );
    }

    const isPasswordCorrect = await admin.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.UNAUTHORIZED,
            "Invalid email or password"
        );
    }
    
    const token = service.generateToken({ id: admin._id });
    return response.responseHandlerWithData(
        res,
        true,
        responseCode.CREATED,
        "Admin logged in successfully",
        { admin: admin, token: token }
    );
})

exports.forgotPassword = catchAsyncError(async (req, res) => {
    const { email } = req.body;

    const admin = await adminModel.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.NOT_FOUND,
            "Admin not found"
        );
    }

    const existingOtp = await otpModel.findOne({ email: admin.email.toLowerCase().trim() });
    if (existingOtp) {
        await otpModel.deleteOne({ _id: existingOtp._id });
    }

    const otpGenerated = service.genrateOtp();

    console.log("otpGenerated:",otpGenerated);

    const otpCreated = await otpModel.create({
        fullName: admin.fullName,
        email: admin.email,
        otp: otpGenerated,
    });

    if (!otpCreated) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.INTERNAL_SERVER_ERROR,
            "Failed to create OTP"
        );
    }
   
    return response.responseHandlerWithData(
        res,
        true,
        responseCode.CREATED,
        "OTP sent successfully. It will expire in 1 minute. Please verify your email with OTP.",
        { otp: otpGenerated }
    );

})

exports.verifyOtp = catchAsyncError(async (req, res) => {
    const { email, otp } = req.body;

    const admin = await adminModel.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.NOT_FOUND,
            "Admin not found"
        );
    }

    const existingOtp = await otpModel.findOne({ email: admin.email.toLowerCase().trim() });
    if (!existingOtp) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.NOT_FOUND,
            "OTP expired"
        );
    }

    if (existingOtp.otp !== otp) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.UNAUTHORIZED,
            "Invalid OTP"
        );
    }
    
    await otpModel.deleteOne({ _id: existingOtp._id });
    const token = service.generateToken({ id: admin._id });
    if (!token) {
        return response.responseHandlerWithError(
            res,
            false,
            responseCode.INTERNAL_SERVER_ERROR,
            "Failed to generate token"
        );
    }
    return response.responseHandlerWithData(
        res,
        true,
        responseCode.CREATED,
        "OTP verified successfully, Using this please set your new password",
        { token: token }
    );

})

exports.resetPassword = catchAsyncError(async (req, res) => {
    const { password } = req.body;
    const adminId = req.user.id;

    console.log("adminId:",adminId);
    const admin = await adminModel.findById(adminId);
    if (!admin) {
        return response.responseHandlerWithError(
            res,
            false,   
            responseCode.NOT_FOUND,
            "Admin not found"
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    await admin.save();
    return response.responseHandlerWithData(
        res,
        true,   
        responseCode.CREATED,
        "Password reset successfully, Please login with your new password",
        { admin:admin._id }
    );
})