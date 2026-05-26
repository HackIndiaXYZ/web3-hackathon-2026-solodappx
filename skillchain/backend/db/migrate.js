/**
 * db/migrate.js — Auto-creates all Neon PostgreSQL tables on startup.
 * Safe to run multiple times (CREATE TABLE IF NOT EXISTS everywhere).
 */

require('dotenv').config()
const { sql } = require('./client')

const migrate = async () => {
  // ── 1. Enums ────────────────────────────────────────────────
  await sql`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('user', 'issuer', 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `
  await sql`
    DO $$ BEGIN
      CREATE TYPE credential_status AS ENUM ('pending', 'verified', 'revoked');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `
  await sql`
    DO $$ BEGIN
      CREATE TYPE credential_category AS ENUM (
        'blockchain', 'development', 'design', 'data-science',
        'cybersecurity', 'ai-ml', 'cloud', 'devops', 'other'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `
  await sql`
    DO $$ BEGIN
      CREATE TYPE chat_role AS ENUM ('user', 'assistant');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `

  // ── 2. users ────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      name            VARCHAR(50)  NOT NULL,
      email           VARCHAR(255) NOT NULL UNIQUE,
      password        TEXT         NOT NULL,
      wallet_address  VARCHAR(42)  UNIQUE,
      bio             TEXT         DEFAULT '',
      website         TEXT         DEFAULT '',
      github          VARCHAR(100) DEFAULT '',
      twitter         VARCHAR(100) DEFAULT '',
      avatar          TEXT         DEFAULT '',
      role            user_role    NOT NULL DEFAULT 'user',
      is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  // ── 3. credentials ──────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS credentials (
      id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
      credential_id       VARCHAR(100)        NOT NULL UNIQUE,
      skill_name          VARCHAR(100)        NOT NULL,
      category            credential_category NOT NULL DEFAULT 'development',
      level               INTEGER             NOT NULL DEFAULT 3
                            CHECK (level BETWEEN 1 AND 5),
      description         TEXT                DEFAULT '',
      recipient_address   VARCHAR(42)         NOT NULL,
      recipient_name      VARCHAR(100)        DEFAULT '',
      recipient_user_id   UUID                REFERENCES users(id) ON DELETE SET NULL,
      issuer_address      VARCHAR(42)         DEFAULT '',
      issuer_name         VARCHAR(100)        DEFAULT '',
      issuer_user_id      UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      issued_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
      expires_at          TIMESTAMPTZ,
      status              credential_status   NOT NULL DEFAULT 'pending',
      tx_hash             VARCHAR(66),
      block_number        INTEGER,
      metadata_hash       VARCHAR(68),
      on_chain_id         VARCHAR(68),
      revoked_at          TIMESTAMPTZ,
      revoked_by          UUID                REFERENCES users(id) ON DELETE SET NULL,
      revocation_reason   TEXT                DEFAULT '',
      is_public           BOOLEAN             NOT NULL DEFAULT TRUE,
      created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    )
  `

  // ── 4. chat_history ─────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS chat_history (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      total_messages  INTEGER     NOT NULL DEFAULT 0,
      last_activity   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // ── 5. chat_messages ────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_history_id  UUID        NOT NULL REFERENCES chat_history(id) ON DELETE CASCADE,
      user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role             chat_role   NOT NULL,
      content          TEXT        NOT NULL,
      tokens           INTEGER     DEFAULT 0,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // ── 6. notifications ────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        VARCHAR(50) NOT NULL DEFAULT 'info',
      title       VARCHAR(200) NOT NULL,
      message     TEXT        NOT NULL,
      data        JSONB       DEFAULT '{}',
      is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // ── 7. transactions (on-chain activity log) ─────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type          VARCHAR(50) NOT NULL DEFAULT 'credential_issue',
      tx_hash       VARCHAR(66) NOT NULL,
      block_number  INTEGER,
      from_address  VARCHAR(42),
      to_address    VARCHAR(42),
      value         VARCHAR(50) DEFAULT '0',
      status        VARCHAR(20) NOT NULL DEFAULT 'confirmed',
      description   TEXT        DEFAULT '',
      credential_id UUID        REFERENCES credentials(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // ── 8. Indexes ──────────────────────────────────────────────
  await sql`CREATE INDEX IF NOT EXISTS idx_cred_issuer    ON credentials(issuer_user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_cred_recipient ON credentials(recipient_address)`
  await sql`CREATE INDEX IF NOT EXISTS idx_cred_status    ON credentials(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_cred_tx_hash   ON credentials(tx_hash)`
  await sql`CREATE INDEX IF NOT EXISTS idx_cred_id        ON credentials(credential_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_msg_hist  ON chat_messages(chat_history_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_chat_msg_user  ON chat_messages(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_wallet   ON users(wallet_address)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notif_user    ON notifications(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_notif_read    ON notifications(user_id, is_read)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tx_user       ON transactions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_tx_hash       ON transactions(tx_hash)`

  // ── 7. updated_at auto-trigger ──────────────────────────────
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `

  await sql`DROP TRIGGER IF EXISTS trg_users_updated_at ON users`
  await sql`
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `

  await sql`DROP TRIGGER IF EXISTS trg_credentials_updated_at ON credentials`
  await sql`
    CREATE TRIGGER trg_credentials_updated_at
      BEFORE UPDATE ON credentials
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `

  await sql`DROP TRIGGER IF EXISTS trg_chat_history_updated_at ON chat_history`
  await sql`
    CREATE TRIGGER trg_chat_history_updated_at
      BEFORE UPDATE ON chat_history
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
  `
}

module.exports = { migrate }