import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});


export const query = (text: string, params?: any[]) => pool.query(text, params);
