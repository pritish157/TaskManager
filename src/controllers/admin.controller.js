import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── Get All Users (Admin Only) ──────────────────────────
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");

    res.status(200).json({
        message: "Users fetched successfully",
        count: users.length,
        users
    });
});

export { getUsers };
