import app from "./app";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in environment variables. Exiting.");
  process.exit(1);
}

const startServer = async () => {
  try {
    // Attempt to connect to the database
    await pool.query("SELECT NOW()");
    console.log("Database connection successful.");

    // Only start the server if the DB connection is successful
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("FATAL: Database connection failed. Server not started.", error);
    process.exit(1);
  }
};

startServer();
