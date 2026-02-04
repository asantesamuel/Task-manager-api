import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in environment variables. Exiting.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
