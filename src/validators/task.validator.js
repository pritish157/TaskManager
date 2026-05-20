import { body, param, validationResult } from "express-validator";

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

// ── Create Task Validation ──────────────────────────────
const createTaskRules = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 100 }).withMessage("Title must be under 100 characters"),

    body("status")
        .optional()
        .isIn(["pending", "in-progress", "completed"]).withMessage("Status must be pending, in-progress, or completed"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),

    validate
];

// ── Update Task Validation ──────────────────────────────
const updateTaskRules = [
    param("id")
        .isMongoId().withMessage("Invalid task ID"),

    body("title")
        .optional()
        .trim()
        .notEmpty().withMessage("Title cannot be empty")
        .isLength({ max: 100 }).withMessage("Title must be under 100 characters"),

    body("status")
        .optional()
        .isIn(["pending", "in-progress", "completed"]).withMessage("Status must be pending, in-progress, or completed"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),

    validate
];

// ── Task ID Param Validation ────────────────────────────
const taskIdRules = [
    param("id")
        .isMongoId().withMessage("Invalid task ID"),

    validate
];

export { createTaskRules, updateTaskRules, taskIdRules };
