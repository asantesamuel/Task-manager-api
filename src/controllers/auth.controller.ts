import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { query } from "../db";

export const register = async (req: Request, res: Response) => {
  try {
    const { fname, email, password } = req.body;

    if (!fname || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check for existing email
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // Return user data along with id
    const result = await query(
      `INSERT INTO users (fname, email, password_hash, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, fname, email, role, created_at`,
      [fname, email, hashed]
    );

    const user = result.rows[0];
    
    // Generate token with all user data
    const token = generateToken(user.id, user.fname, user.email, user.role);
    
    // Return both token and user object (frontend expects this)
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        fname:user.fname,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    // Get user data including role and created_at
    const result = await query(
      `SELECT id, fname, email, role, password_hash, created_at 
       FROM users WHERE email = $1`, 
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token with all user data
    const token = generateToken(user.id, user.fname, user.email, user.role);
    
    // Return both token and user object (frontend expects this)
    res.json({ 
      token,
      user: {
        id: user.id,
        fname: user.fname,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

