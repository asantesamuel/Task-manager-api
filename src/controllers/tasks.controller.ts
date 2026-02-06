import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

// Helper function to check if the user owns the task or is an admin
const isOwnerOrAdmin = (req: AuthRequest, task: { user_id: string }): boolean => {
  if (!req.user) {
    return false; // Should not happen if 'protect' middleware is used
  }
  return task.user_id === req.user.userId || req.user.role === 'admin';
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    // Map frontend fields to database fields
    // Frontend sends: status ('pending' | 'completed')
    // Database has: completed (boolean)
    const completed = status === 'completed';

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, completed, priority, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        req.userId,
        title,
        description || null,
        completed,
        priority || 'medium',
        dueDate || null
      ]
    );

    const task = result.rows[0];
    
    // Map database fields back to frontend format
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? 'completed' : 'pending',
      priority: task.priority || 'medium',
      dueDate: task.due_date,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };

    res.status(201).json(formattedTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    
    // Map all tasks to frontend format
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
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    const task = result.rows[0];
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isOwnerOrAdmin(req, task)) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this task" });
    }

    // Format task for frontend
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? 'completed' : 'pending',
      priority: task.priority || 'medium',
      dueDate: task.due_date,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };

    res.json(formattedTask);
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    const task = result.rows[0];
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isOwnerOrAdmin(req, task)) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this task" });
    }

    // Map frontend status to database completed field
    const completed = status === 'completed' ? true : status === 'pending' ? false : null;

    const upd = await query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           completed = COALESCE($3, completed),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : null,
        completed,
        priority || null,
        dueDate !== undefined ? dueDate : null,
        id
      ]
    );

    const updatedTask = upd.rows[0];
    
    // Format for frontend
    const formattedTask = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.completed ? 'completed' : 'pending',
      priority: updatedTask.priority || 'medium',
      dueDate: updatedTask.due_date,
      userId: updatedTask.user_id,
      createdAt: updatedTask.created_at,
      updatedAt: updatedTask.updated_at
    };

    res.json(formattedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
    const task = result.rows[0];
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!isOwnerOrAdmin(req, task)) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this task" });
    }

    await query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.status(204).send(); // Use 204 No Content instead of 200 with message
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
