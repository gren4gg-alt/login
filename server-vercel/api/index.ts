import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "../src/routes/auth.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

// No app.listen() here — Vercel invokes this exported handler per-request
// instead of running a persistent server process.
export default app;
