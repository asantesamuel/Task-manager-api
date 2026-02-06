import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

console.log(`Attempting to connect to PostgreSQL: ${process.env.PG_USER}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`);

export const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  // Fail fast if connection cannot be established
  connectionTimeoutMillis: 5000,
});

pool.on("connect", (client) => {
  console.log(`Successfully established connection to PostgreSQL database "${process.env.PG_DATABASE}" on ${process.env.PG_HOST}:${process.env.PG_PORT}`);
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
