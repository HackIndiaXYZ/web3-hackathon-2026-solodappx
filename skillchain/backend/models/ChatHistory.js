/**
 * models/ChatHistory.js
 * Chat history queries using Neon PostgreSQL.
 * Two tables: chat_history (session) + chat_messages (rows)
 */

const { sql } = require('../db/client')
const { v4: uuidv4 } = require('uuid')

const ChatHistory = {
  // ── Ensure a chat_history row exists for the user ─────────
  async ensureSession(userId) {
    // Upsert — creates session if it doesn't exist
    const rows = await sql`
      INSERT INTO chat_history (id, user_id)
      VALUES (${uuidv4()}, ${userId})
      ON CONFLICT (user_id) DO UPDATE
        SET last_activity = NOW()
      RETURNING *
    `
    return rows[0]
  },

  // ── Save a message pair (user + assistant) ────────────────
  async saveMessages(userId, { userMessage, aiMessage, tokens = 0 }) {
    const session = await this.ensureSession(userId)
    const sessionId = session.id

    // Insert both messages in one round-trip
    await sql`
      INSERT INTO chat_messages (id, chat_history_id, user_id, role, content, tokens)
      VALUES
        (${uuidv4()}, ${sessionId}, ${userId}, 'user',      ${userMessage}, 0),
        (${uuidv4()}, ${sessionId}, ${userId}, 'assistant', ${aiMessage},   ${tokens})
    `

    // Update message count
    await sql`
      UPDATE chat_history
      SET total_messages = total_messages + 2,
          last_activity  = NOW(),
          updated_at     = NOW()
      WHERE id = ${sessionId}
    `

    // Trim to last 100 messages (keep chat from growing forever)
    await sql`
      DELETE FROM chat_messages
      WHERE chat_history_id = ${sessionId}
        AND id NOT IN (
          SELECT id FROM chat_messages
          WHERE chat_history_id = ${sessionId}
          ORDER BY created_at DESC
          LIMIT 100
        )
    `
  },

  // ── Get messages for a user (most recent 100) ────────────
  async getMessages(userId) {
    const rows = await sql`
      SELECT cm.id, cm.role, cm.content, cm.tokens, cm.created_at AS timestamp
      FROM chat_messages cm
      JOIN chat_history  ch ON ch.id = cm.chat_history_id
      WHERE ch.user_id = ${userId}
      ORDER BY cm.created_at ASC
      LIMIT 100
    `
    return rows
  },

  // ── Clear all messages for a user ────────────────────────
  async clearMessages(userId) {
    await sql`
      DELETE FROM chat_messages
      WHERE chat_history_id = (
        SELECT id FROM chat_history WHERE user_id = ${userId}
      )
    `
    await sql`
      UPDATE chat_history
      SET total_messages = 0, updated_at = NOW()
      WHERE user_id = ${userId}
    `
    return true
  },

  // ── Get recent N messages for AI context ─────────────────
  async getRecentForContext(userId, limit = 10) {
    const rows = await sql`
      SELECT role, content
      FROM chat_messages
      WHERE chat_history_id = (
        SELECT id FROM chat_history WHERE user_id = ${userId}
      )
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    // Return in chronological order
    return rows.reverse()
  },
}

module.exports = ChatHistory
