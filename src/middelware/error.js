const response = require("../utilities/responseMsg");
const statusCode = require("../utilities/responseCode");


const errorMiddleware = async (err, req, res, next) => {
    err.statusCode = err.statusCode || statusCode.ERROR;
    err.message = err.message || "Internal server error";
    if (req.session) {
        const session = req.session;
        await session.abortTransaction();
        await session.endSession();
    }
    return response.responseHandlerWithError(res, false, err.statusCode, err.message)
}

module.exports = errorMiddleware;