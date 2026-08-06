CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,                 -- nullable: Google-only users have no password
  google_id VARCHAR(255) UNIQUE,      -- set for users who signed up/in via Google
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);

-- If you already ran the old schema.sql, run these instead:
-- ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
