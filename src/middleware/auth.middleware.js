import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/config.js";

// ── Protect Route ───────────────────────────────────────
// Verifies the access token from "Authorization: Bearer <token>" header.
// If valid, attaches the full user object to req.user and calls next().
// If invalid/missing, returns 401.
async function protect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized — user not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized — invalid or expired token" });
    }
}

// ── Authorize Roles ─────────────────────────────────────
// Use AFTER protect middleware. Checks if req.user.role is in the allowed list.
// Example usage: authorize("admin") — only admins can access.
function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden — you do not have permission" });
        }
        next();
    };
}

export { protect, authorize };
