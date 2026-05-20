import Task from "../models/task.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── Create Task ─────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority } = req.body;

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        createdBy: req.user._id
    });

    res.status(201).json({
        message: "Task created successfully",
        task
    });
});

// ── Get All My Tasks ────────────────────────────────────
const getTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        message: "Tasks fetched successfully",
        count: tasks.length,
        tasks
    });
});

// ── Get Single Task ─────────────────────────────────────
const getTask = asyncHandler(async (req, res) => {
    const task = await Task.findOne({
        _id: req.params.id,
        createdBy: req.user._id
    });

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
        message: "Task fetched successfully",
        task
    });
});

// ── Update Task ─────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority } = req.body;

    const task = await Task.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user._id },
        { title, description, status, priority },
        { new: true, runValidators: true }
    );

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
        message: "Task updated successfully",
        task
    });
});

// ── Delete Task ─────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user._id
    });

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
        message: "Task deleted successfully"
    });
});

export { createTask, getTasks, getTask, updateTask, deleteTask };
