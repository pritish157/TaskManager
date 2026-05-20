import { Router } from "express";
import { register, login, getMe, refreshToken } from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";
import { registerRules, loginRules } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post('/register', registerRules, register);
authRouter.post('/login', loginRules, login);
authRouter.get('/me', protect, getMe);
authRouter.get('/refresh-token', refreshToken);

export default authRouter;