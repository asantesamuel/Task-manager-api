import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    
    // Format user data consistently
    const formattedUsers = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(`SELECT * FROM tasks ORDER BY created_at DESC`);
    
    // Format tasks for frontend
    const formattedTasks = result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? 'completed' : 'pending',
      priority: task.priority || 'medium',
      dueDate: task.due_date,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));
    
    res.json(formattedTasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAnyTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT id FROM tasks WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.status(204).send(); // Use 204 No Content for successful deletion
  } catch (error) {
    console.error("Delete any task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
