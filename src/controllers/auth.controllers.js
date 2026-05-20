import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import asyncHandler from "../utils/asyncHandler.js";

// ── Register ────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    const isAlreadyExist = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (isAlreadyExist) {
        return res.status(409).json({ message: "Username or email already exists" });
    }

    // bcrypt: salt rounds = 10 (good default, slow enough to resist brute-force)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword
    });

    const access_token = jwt.sign(
        { id: user._id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refresh_token = jwt.sign(
        { id: user._id },
        config.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message: "User registered successfully",
        user: {
            username: user.username,
            email: user.email,
            role: user.role
        },
        token: { access_token }
    });
});

// ── Login ───────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const access_token = jwt.sign(
        { id: user._id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refresh_token = jwt.sign(
        { id: user._id },
        config.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email,
            role: user.role
        },
        token: { access_token }
    });
});

// ── Get Me ──────────────────────────────────────────────
// Protected by "protect" middleware — req.user is already available
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// ── Refresh Token ───────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
    const refresh_token = req.cookies.refresh_token;

    if (!refresh_token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(refresh_token, config.JWT_REFRESH_SECRET);

        // Fetch fresh user data to get current role
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const access_token = jwt.sign(
            { id: user._id, role: user.role },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.status(200).json({
            message: "Access token refreshed successfully",
            token: { access_token }
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
});

export { register, getMe, refreshToken, login };
