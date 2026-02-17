const response = require("../utilities/responseMsg");
const responseCode = require("../utilities/responseCode");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body against schema
      
      const validatedData = schema.parse(req.body);
      
      // Replace req.body with validated and sanitized data
      req.body = validatedData;
      
      next();
    } catch (error) {
      // Check if it's a Zod validation error
      if (error.name === "ZodError" && error.issues) {
        // Format Zod validation errors with field names
        const errorMessages = error.issues.map((err) => {
          const fieldName = err.path.length > 0 ? err.path.join(".") : "unknown";
          return {
            field: fieldName,
            message: err.message,
          };
        });

        // Create a user-friendly error message with field name
        const errorMessage = errorMessages.length === 1
          ? `${errorMessages[0].field}: ${errorMessages[0].message}`
          : `Validation failed: ${errorMessages.map((e) => `${e.field}: ${e.message}`).join(", ")}`;

        // Send error response with validation details (always include errors array)
        return response.responseHandlerWithData(
          res,
          false,
          responseCode.BAD_REQUEST,
          errorMessage,
          { errors: errorMessages }
        );
      }

      // Unexpected error
      return response.responseHandlerWithError(
        res,
        false,
        responseCode.BAD_REQUEST,
        "Validation error occurred"
      );
    }
  };
};

module.exports = { validate };