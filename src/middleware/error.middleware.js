// Global error handler — catches all errors forwarded by asyncHandler or next(err).
// Must have 4 parameters (err, req, res, next) — Express recognizes this as error middleware.

function errorHandler(err, req, res, next) {
    console.error("Error:", err.message);

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    // Mongoose duplicate key (e.g., duplicate email/username)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ message: `${field} already exists` });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: "Validation failed", errors: messages });
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error"
    });
}

export default errorHandler;
