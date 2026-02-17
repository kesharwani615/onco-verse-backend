const dayjs = require("dayjs");
const jwt = require("jsonwebtoken");

exports.genrateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.generateToken = (payload) => {
try {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
} catch (error) {
    console.log("error in generateToken:",error);
    throw new Error("Failed to generate token");
}
}

exports.getCurrentTime = () => {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
}