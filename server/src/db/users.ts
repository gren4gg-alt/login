import { pool } from "./pool.js";

export interface User {
  id: number;
  email: string;
  password_hash: string | null;
  google_id: string | null;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, email, password_hash, google_id, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, google_id, created_at`,
    [email, passwordHash]
  );
  return result.rows[0];
}

// Finds a user by their Google account, creating one if this is their first
// time signing in with Google. If a Postgres account with the same email
// already exists (e.g. they signed up with a password), it links the
// google_id to that existing account instead of creating a duplicate.
export async function findOrCreateGoogleUser(
  email: string,
  googleId: string
): Promise<User> {
  const existing = await findUserByEmail(email);

  if (existing) {
    if (!existing.google_id) {
      const linked = await pool.query<User>(
        `UPDATE users SET google_id = $1 WHERE id = $2
         RETURNING id, email, password_hash, google_id, created_at`,
        [googleId, existing.id]
      );
      return linked.rows[0];
    }
    return existing;
  }

  const created = await pool.query<User>(
    `INSERT INTO users (email, google_id)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, google_id, created_at`,
    [email, googleId]
  );
  return created.rows[0];
}

export async function setResetToken(
  email: string,
  token: string,
  expiresAt: Date
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3`,
    [token, expiresAt, email]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findUserByResetToken(token: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT id, email, password_hash, google_id, created_at FROM users
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [token]
  );
  return result.rows[0] ?? null;
}

export async function updatePasswordAndClearToken(
  userId: number,
  passwordHash: string
): Promise<void> {
  await pool.query(
    `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [passwordHash, userId]
  );
}
