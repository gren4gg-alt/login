import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  findOrCreateGoogleUser,
  setResetToken,
  findUserByResetToken,
  updatePasswordAndClearToken,
} from "../db/users.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { firebaseAuth } from "../firebaseAdmin.js";
import { sendPasswordResetEmail } from "../mailer.js";

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

  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Frontend signs in with Firebase (Google popup), then sends us the
// resulting Firebase ID token. We verify it server-side and issue our
// own JWT so the rest of the app doesn't need to know Firebase exists.
const googleSchema = z.object({ idToken: z.string().min(10) });

router.post("/google", async (req, res) => {
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Missing Google ID token." });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ error: "Google account has no email." });
    }

    const user = await findOrCreateGoogleUser(email, decoded.uid);
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Google auth verification failed:", err);
    res.status(401).json({ error: "Could not verify Google sign-in." });
  }
});

const forgotSchema = z.object({ email: z.string().email() });

router.post("/forgot-password", async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  const { email } = parsed.data;

  const user = await findUserByEmail(email);

  // Google-only accounts have no password_hash at all — there's nothing
  // for our own reset flow to reset. Firebase doesn't let a backend trigger
  // a reset email on someone's behalf either (that's a frontend SDK call
  // tied to Firebase-stored passwords, which these accounts don't have).
  // So just tell them how to get back in.
  if (user && user.google_id && !user.password_hash) {
    return res.json({
      message: "This account uses Google Sign-In. Use \"Continue with Google\" to sign in — there's no password to reset.",
    });
  }

  // Postgres email/password accounts: generate a reset token. Actually
  // emailing it requires SMTP env vars to be configured — leaving that
  // wired up but not required to run the rest of the app for now.
  if (user && user.password_hash) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await setResetToken(email, token, expires);

    const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (err) {
      console.error("Failed to send reset email (is SMTP configured?):", err);
    }
  }

  // Same generic response whether or not the account exists, so requests
  // can't be used to discover which emails are registered.
  res.json({ message: "If that email is registered, a reset link has been sent." });
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request." });
  }
  const { token, password } = parsed.data;

  const user = await findUserByResetToken(token);
  if (!user) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updatePasswordAndClearToken(user.id, passwordHash);

  res.json({ message: "Password updated. You can now sign in." });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  res.json({ userId: req.userId });
});

export default router;
