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

    const dueFields = task.due_at
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
    const { timeZone } = req.query as { timeZone: string };

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
    const { timeZone } = req.query as { timeZone: string };

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

    const dueAtUtc =
      dueDate && dueTime && timeZone
        ? toUtcDueAt(dueDate, dueTime, timeZone)
        : null;

    const result = await query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         completed = COALESCE($3, completed),
         priority = COALESCE($4, priority),
         due_at = COALESCE($5, due_at),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : null,
        completed,
        priority || null,
        dueAtUtc,
        id,
      ],
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
