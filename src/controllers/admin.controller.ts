import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";
import bcrypt from "bcrypt";

/* =========================
   GET ALL USERS
========================= */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Get users with their task counts
    const result = await query(
      `SELECT 
        u.id, 
        u.fname,
        u.email, 
        u.role,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(t.id) as task_count
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      GROUP BY u.id, u.fname, u.email, u.role, u.is_active, u.created_at, u.updated_at
      ORDER BY u.created_at DESC`
    );
    
    // Format user data consistently
    const formattedUsers = result.rows.map(user => ({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: parseInt(user.task_count) || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT 
        u.id, 
        u.fname,
        u.email, 
        u.role,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(t.id) as task_count
      FROM users u
      LEFT JOIN tasks t ON u.id = t.user_id
      WHERE u.id = $1
      GROUP BY u.id, u.fname, u.email, u.role, u.is_active, u.created_at, u.updated_at`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: parseInt(user.task_count) || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   CREATE USER (ADMIN)
========================= */
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { fname, email, password, role = 'user' } = req.body;

    // Validate required fields
    if (!fname || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (fname, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, fname, email, role, is_active, created_at, updated_at`,
      [fname, email, hashedPassword, role, true]
    );

    const user = result.rows[0];
    res.status(201).json({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   UPDATE USER
========================= */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fname, email, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await query(
      `SELECT id FROM users WHERE id = $1`,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (fname !== undefined) {
      updates.push(`fname = $${paramCount++}`);
      values.push(fname);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, fname, email, role, is_active, created_at, updated_at`,
      values
    );

    const user = result.rows[0];
    
    // Get task count
    const taskCountResult = await query(
      `SELECT COUNT(*) as count FROM tasks WHERE user_id = $1`,
      [id]
    );

    res.json({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: parseInt(taskCountResult.rows[0].count) || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.userId === id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    // Check if user exists
    const existingUser = await query(
      `SELECT id FROM users WHERE id = $1`,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's tasks first (if you want to keep tasks, remove this)
    await query(`DELETE FROM tasks WHERE user_id = $1`, [id]);

    // Delete user
    await query(`DELETE FROM users WHERE id = $1`, [id]);

    res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   TOGGLE USER ROLE
========================= */
export const toggleUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from changing their own role
    if (req.user?.userId === id) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    // Get current role
    const userResult = await query(
      `SELECT role FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentRole = userResult.rows[0].role;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    // Update role
    const result = await query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, fname, email, role, is_active, created_at, updated_at`,
      [newRole, id]
    );

    const user = result.rows[0];
    
    // Get task count
    const taskCountResult = await query(
      `SELECT COUNT(*) as count FROM tasks WHERE user_id = $1`,
      [id]
    );

    res.json({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: parseInt(taskCountResult.rows[0].count) || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error("Toggle user role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   TOGGLE USER STATUS
========================= */
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (req.user?.userId === id) {
      return res.status(400).json({ message: "You cannot change your own status" });
    }

    // Get current status
    const userResult = await query(
      `SELECT is_active FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentStatus = userResult.rows[0].is_active;
    const newStatus = !currentStatus;

    // Update status
    const result = await query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, fname, email, role, is_active, created_at, updated_at`,
      [newStatus, id]
    );

    const user = result.rows[0];
    
    // Get task count
    const taskCountResult = await query(
      `SELECT COUNT(*) as count FROM tasks WHERE user_id = $1`,
      [id]
    );

    res.json({
      id: user.id,
      fname: user.fname,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      taskCount: parseInt(taskCountResult.rows[0].count) || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   GET ALL TASKS (ADMIN)
========================= */
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { timeZone } = req.query as { timeZone?: string };

    const result = await query(
      `SELECT 
        t.*,
        u.fname as user_fname,
        u.email as user_email
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC`
    );
    
    // Format tasks for frontend
    const formattedTasks = result.rows.map(task => {
      // Handle due date/time conversion if timezone provided
      let dueDate = null;
      let dueTime = null;
      
      if (task.due_at && timeZone) {
        // You'll need to implement the fromUtcDueAt function or import it
        // For now, just return the raw values
        dueDate = task.due_at;
      }

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.completed ? 'completed' : 'pending',
        priority: task.priority || 'medium',
        dueDate: dueDate,
        dueTime: dueTime,
        userId: task.user_id,
        user: task.user_fname ? {
          id: task.user_id,
          fname: task.user_fname,
          email: task.user_email
        } : undefined,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      };
    });
    
    res.json(formattedTasks);
  } catch (error) {
    console.error("Get all tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   DELETE ANY TASK (ADMIN)
========================= */
export const deleteAnyTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`SELECT id FROM tasks WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await query(`DELETE FROM tasks WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Delete any task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};