import { protect } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";

import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserRole,
  toggleUserStatus,
  getAllTasks,
  deleteAnyTask,
} from "../controllers/admin.controller";

const router = Router();

router.use(protect, requireAdmin);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/toggle-role", toggleUserRole);
router.patch("/users/:id/toggle-status", toggleUserStatus);

// Task Management Routes
router.get("/tasks", getAllTasks);
router.delete("/tasks/:id", deleteAnyTask);

export default router;

// router.get("/users", getAllUsers);
// router.get("/tasks", getAllTasks);
// router.delete("/tasks/:id", deleteAnyTask);
