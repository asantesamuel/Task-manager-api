import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: "title is required" });

  const result = await query(
    `INSERT INTO tasks (user_id, title, description, completed) VALUES ($1, $2, $3, false) RETURNING *`,
    [req.userId, title, description || null]
  );

  res.status(201).json(result.rows[0]);
};

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  const result = await query(`SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [
    req.userId,
  ]);
  res.json(result.rows);
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.user_id !== req.userId) {
    const adm = await query(`SELECT role FROM users WHERE id = $1`, [req.userId]);
    if (!adm.rows[0] || adm.rows[0].role !== "admin") return res.status(403).json({ message: "Forbidden" });
  }

  res.json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.user_id !== req.userId) {
    const adm = await query(`SELECT role FROM users WHERE id = $1`, [req.userId]);
    if (!adm.rows[0] || adm.rows[0].role !== "admin") return res.status(403).json({ message: "Forbidden" });
  }

  const upd = await query(
    `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
    [title || null, description || null, typeof completed === "boolean" ? completed : null, id]
  );

  res.json(upd.rows[0]);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (task.user_id !== req.userId) {
    const adm = await query(`SELECT role FROM users WHERE id = $1`, [req.userId]);
    if (!adm.rows[0] || adm.rows[0].role !== "admin") return res.status(403).json({ message: "Forbidden" });
  }

  await query(`DELETE FROM tasks WHERE id = $1`, [id]);
  res.status(204).send();
};