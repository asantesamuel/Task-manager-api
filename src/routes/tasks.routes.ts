import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { createTask, getMyTasks, getTaskById, updateTask, deleteTask } from "../controllers/tasks.controller";

const router = Router();

router.use(protect);

router.post("/", createTask);
router.get("/", getMyTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
