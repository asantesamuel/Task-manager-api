"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { generateToken } = require('../utils/jwt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING });

exports.register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, hashedPassword]);
    const userId = result.rows[0].id;
    res.json({ token: generateToken(userId) });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT id, password FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user.id) });
};
