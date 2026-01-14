import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { query } from "../db";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`,
    [email, hashedPassword]
  );

  const userId = result.rows[0].id;

  res.json({ token: generateToken(userId) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await query(`SELECT id, password FROM users WHERE email = $1`, [
    email,
  ]);

  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(user.id) });
};
