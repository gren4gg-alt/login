import { Pool } from "pg";
import "dotenv/config";

// Small max pool size — each serverless invocation may spin up its own
// pool, so keep this low and use a connection-pooling-friendly DATABASE_URL
// (e.g. Neon or Supabase's "pooled connection" string) in production.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});
