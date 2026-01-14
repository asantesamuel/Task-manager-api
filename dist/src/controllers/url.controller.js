"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectUrl = exports.createShortUrl = void 0;
const extension_1 = require("@prisma/client/extension");
const generateCode_1 = require("../utils/generateCode");
const prisma = new extension_1.PrismaClient();
const createShortUrl = async (req, res) => {
    const { originalUrl } = req.body;
    const url = await prisma.url.create({
        data: {
            originalUrl,
            shortCode: (0, generateCode_1.generateCode)(),
        const { Pool } = require('pg');
        },
        const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING });
    res.json(url);
};
exports.createShortUrl = createShortUrl;
            const shortCode = generateCode();
            const result = await pool.query('INSERT INTO urls (original_url, short_code, user_id, is_active) VALUES ($1, $2, $3, true) RETURNING *', [originalUrl, shortCode, req.userId]);
            res.json(result.rows[0]);
        data: {
            urlId: url.id,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        },
            const result = await pool.query('SELECT * FROM urls WHERE short_code = $1', [code]);
            const url = result.rows[0];
            if (!url || !url.is_active) return res.status(404).json({ message: 'Link not found' });
            await pool.query('INSERT INTO clicks (url_id, ip, user_agent) VALUES ($1, $2, $3)', [url.id, req.ip, req.headers['user-agent']]);
            res.redirect(url.original_url);
    });
