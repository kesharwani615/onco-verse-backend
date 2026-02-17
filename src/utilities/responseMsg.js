module.exports = {
    responseHandlerWithData: (res, success, code, message, data) => {
        return res.status(code).json({ success, message, data });
    },
    responseHandlerWithMessage: (res, success, code, message) => {
        return res.status(code).json({ success, message,});
    },
    responseHandlerWithError: (res, success, code, message) => {
        return res.status(code).json({ success, message });
    },
}