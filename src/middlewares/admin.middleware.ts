import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { query } from "../db";

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
try {
    const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Not authorized" });

  const result = await query(`SELECT role FROM users WHERE id = $1`, [userId]);
  const user = result.rows[0];
  if (!user || user.role !== "admin") return res.status(403).json({ message: "Admin privileges required" });

  next();
}catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};