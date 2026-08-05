import { pool } from "./pool.js";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
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
     RETURNING id, email, password_hash, created_at`,
    [email, passwordHash]
  );
  return result.rows[0];
}
