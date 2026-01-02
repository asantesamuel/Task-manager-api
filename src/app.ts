import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import urlRoutes from "./routes/url.routes";
import analyticsRoutes from "./routes/analytics.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
