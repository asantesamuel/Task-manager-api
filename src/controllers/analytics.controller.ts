import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  // Aggregate URLs with their clicks as JSON
  const sql = `
    SELECT
      urls.*,
      COALESCE(json_agg(clicks.*) FILTER (WHERE clicks.id IS NOT NULL), '[]') AS clicks
    FROM urls
    LEFT JOIN clicks ON clicks.url_id = urls.id
    WHERE urls.user_id = $1
    GROUP BY urls.id
  `;

  const result = await query(sql, [req.userId]);
  res.json(result.rows);
};
