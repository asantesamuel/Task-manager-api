import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";
import { DateTime } from "luxon";

/* =========================
   Time conversion helpers
========================= */

function toUtcDueAt(
  dueDate: string,
  dueTime: string,
  timeZone: string,
): string | null {
  if (!dueDate || !dueTime || !timeZone) return null;

  return DateTime.fromISO(`${dueDate}T${dueTime}`, { zone: timeZone })
    .toUTC()
    .toISO();
}

function fromUtcDueAt(dueAtUtc: string, timeZone: string) {
  const dt = DateTime.fromISO(dueAtUtc, { zone: "utc" }).setZone(timeZone);

  return {
    dueDate: dt.toISODate(),
    dueTime: dt.toFormat("HH:mm"),
  };
}

/* =========================
   CREATE TASK
========================= */

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, dueTime, timeZone } =
      req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const completed = status === "completed";

    const dueAtUtc = toUtcDueAt(dueDate, dueTime, timeZone);
    console.log("RAW BODY:", req.body);
    console.log("dueDate:", dueDate);
    console.log("dueTime:", dueTime);
    console.log("timeZone:", timeZone);
    console.log("dueAtUtc:", dueAtUtc);

    const result = await query(
      `INSERT INTO tasks (
        user_id,
        title,
        description,
        completed,
        priority,
        due_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        req.user?.userId,
        title,
        description || null,
        completed,
        priority || "medium",
        dueAtUtc,
      ],
    );

    const task = result.rows[0];

    const dueFields =
      task.due_at && timeZone
        ? fromUtcDueAt(task.due_at, timeZone)
        : { dueDate: null, dueTime: null };

    res.status(201).json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? "completed" : "pending",
      priority: task.priority,
      ...dueFields,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   GET ALL TASKS
========================= */

export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { timeZone } = req.query as { timeZone?: string };

    const result = await query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user?.userId],
    );

    const tasks = result.rows.map((task) => {
      const dueFields =
        task.due_at && timeZone
          ? fromUtcDueAt(task.due_at, timeZone)
          : { dueDate: null, dueTime: null };

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.completed ? "completed" : "pending",
        priority: task.priority,
        ...dueFields,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      };
    });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   GET TASK BY ID
========================= */

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { timeZone } = req.query as { timeZone?: string };

    const result = await query(`SELECT * FROM tasks WHERE id = $1`, [id]);

    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const dueFields =
      task.due_at && timeZone
        ? fromUtcDueAt(task.due_at, timeZone)
        : { dueDate: null, dueTime: null };

    res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? "completed" : "pending",
      priority: task.priority,
      ...dueFields,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   UPDATE TASK
========================= */

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, dueTime, timeZone } =
      req.body;

    

    const completed =
      status === "completed" ? true : status === "pending" ? false : null;

    // Allow explicit null to clear the due date
    let dueAtUtc = undefined;
    if (
      dueDate !== undefined &&
      dueTime !== undefined &&
      timeZone !== undefined
    ) {
      dueAtUtc =
        dueDate && dueTime && timeZone
          ? toUtcDueAt(dueDate, dueTime, timeZone)
          : null; // Explicitly set to null if clearing
    }

    console.log("RAW BODY:", req.body);
    console.log("dueDate:", dueDate);
    console.log("dueTime:", dueTime);
    console.log("timeZone:", timeZone);
    console.log("dueAtUtc:", dueAtUtc);

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description || null);
    }
    if (completed !== null) {
      updates.push(`completed = $${paramCount++}`);
      values.push(completed);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (dueAtUtc !== undefined) {
      updates.push(`due_at = $${paramCount++}`);
      values.push(dueAtUtc);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values,
    );

    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const dueFields =
      task.due_at && timeZone
        ? fromUtcDueAt(task.due_at, timeZone)
        : { dueDate: null, dueTime: null };

    res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.completed ? "completed" : "pending",
      priority: task.priority,
      ...dueFields,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   DELETE TASK
========================= */

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`DELETE FROM tasks WHERE id = $1 RETURNING id`, [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
