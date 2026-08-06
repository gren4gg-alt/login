import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "../src/routes/auth.js";

const app = express();

const corsOptions = {
  // 1. MUST match your Vite dev URL (http://localhost:5173) or production frontend URL exactly
  // Do NOT include trailing slashes (e.g., use "http://localhost:5173", not "http://localhost:5173/")
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // Important for legacy browser support on preflight requests
};

// Apply CORS globally to handle headers and preflight checks across all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

export default app;