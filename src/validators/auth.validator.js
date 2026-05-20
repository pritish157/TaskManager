import { body, validationResult } from "express-validator";

// ── Shared: runs after validation rules, catches errors ─
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

// ── Register Validation ─────────────────────────────────
const registerRules = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores")
        .toLowerCase(),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number")
        .custom((password, { req }) => {
            const pw = password.toLowerCase();
            const username = (req.body.username || "").toLowerCase();
            const email = (req.body.email || "").split("@")[0].toLowerCase();

            if (username && pw.includes(username)) {
                throw new Error("Password must not contain your username");
            }
            if (email && pw.includes(email)) {
                throw new Error("Password must not contain your email");
            }
            return true;
        }),

    validate
];

// ── Login Validation ────────────────────────────────────
const loginRules = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required"),

    validate
];

export { registerRules, loginRules };
