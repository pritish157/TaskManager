import { Router } from "express";
import { createTask, getTasks, getTask, updateTask, deleteTask } from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { createTaskRules, updateTaskRules, taskIdRules } from "../validators/task.validator.js";

const taskRouter = Router();

// All task routes are protected
taskRouter.use(protect);

taskRouter.post('/', createTaskRules, createTask);
taskRouter.get('/', getTasks);
taskRouter.get('/:id', taskIdRules, getTask);
taskRouter.put('/:id', updateTaskRules, updateTask);
taskRouter.delete('/:id', taskIdRules, deleteTask);

export default taskRouter;
