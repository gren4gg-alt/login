import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
