import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import { getAllUsers, getAllTasks, deleteAnyTask } from "../controllers/admin.controller";

const router = Router();

router.use(protect, requireAdmin);

router.get("/users", getAllUsers);
router.get("/tasks", getAllTasks);
router.delete("/tasks/:id", deleteAnyTask);

export default router;
