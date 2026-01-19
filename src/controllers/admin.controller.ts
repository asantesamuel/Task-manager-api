import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const result = await query(`SELECT id, email, role, created_at FROM users ORDER BY created_at`);
  res.json(result.rows);
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  const result = await query(`SELECT * FROM tasks ORDER BY created_at DESC`);
  res.json(result.rows);
};

export const deleteAnyTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await query(`SELECT id FROM tasks WHERE id = $1`, [id]);
  if (result.rows.length === 0) return res.status(404).json({ message: "Task not found" });

  await query(`DELETE FROM tasks WHERE id = $1`, [id]);
  res.status(204).send();
};