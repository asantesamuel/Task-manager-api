"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING });

exports.getAnalytics = async (req, res) => {
        const sql = `
        SELECT
            urls.*,
            COALESCE(json_agg(clicks.*) FILTER (WHERE clicks.id IS NOT NULL), '[]') AS clicks
        FROM urls
        LEFT JOIN clicks ON clicks.url_id = urls.id
        WHERE urls.user_id = $1
        GROUP BY urls.id
    `;
        const result = await pool.query(sql, [req.userId]);
        res.json(result.rows);
};
