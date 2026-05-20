import { Router } from "express";
import { getUsers } from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const adminRouter = Router();

// Both middlewares run in order: protect (is logged in?) → authorize (is admin?)
adminRouter.get('/users', protect, authorize("admin"), getUsers);

export default adminRouter;
