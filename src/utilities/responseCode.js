module.exports = {
    SUCCESS: 200,
    CREATED: 201,
    UPDATED: 202,

    BAD_REQUEST: 400,        // ❌ Client sent wrong / missing data
    UNAUTHORIZED: 401,       // ❌ Token missing / invalid
    FORBIDDEN: 403,          // ❌ Access denied
    NOT_FOUND: 404,          // ❌ Resource/User not found

    CONFLICT: 409,           // ❌ Duplicate / Already exists
    ERROR: 500               // ❌ Server error
};
