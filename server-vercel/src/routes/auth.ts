import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createUser, findUserByEmail } from "../db/users.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || "1h",
  });
}

router.post("/signup", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const { email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash);
  const token = signToken(user.id);

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  res.json({ userId: req.userId });
});

export default router;
