import { Response } from "express";
import { generateCode } from "../utils/generateCode";
import { AuthRequest } from "../middlewares/auth.middleware";
import { query } from "../db";

export const createShortUrl = async (req: AuthRequest, res: Response) => {
  const { originalUrl } = req.body;

  const shortCode = generateCode();
  const result = await query(
    `INSERT INTO urls (original_url, short_code, user_id, is_active) VALUES ($1, $2, $3, true) RETURNING *`,
    [originalUrl, shortCode, req.userId]
  );

  res.json(result.rows[0]);
};

export const redirectUrl = async (req: any, res: Response) => {
  const { code } = req.params;
  const result = await query(`SELECT * FROM urls WHERE short_code = $1`, [code]);
  const url = result.rows[0];

  if (!url || !url.is_active) return res.status(404).json({ message: "Link not found" });

  await query(
    `INSERT INTO clicks (url_id, ip, user_agent) VALUES ($1, $2, $3)`,
    [url.id, req.ip, req.headers["user-agent"]]
  );

  res.redirect(url.original_url);
};
