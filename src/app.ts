import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import tasksRoutes from "./routes/tasks.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/admin", adminRoutes);

export default app;
