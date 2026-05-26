/**
 * models/User.js
 * All user-related database queries using Neon + raw SQL.
 * No ORM magic — explicit, readable, fast.
 */

const { sql } = require('../db/client')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const User = {
  // ── Create ──────────────────────────────────────────────────
  async create({ name, email, password, role = 'user' }) {
    const hash = await bcrypt.hash(password, 12)
    const rows = await sql`
      INSERT INTO users (id, name, email, password, role)
      VALUES (${uuidv4()}, ${name.trim()}, ${email.toLowerCase().trim()}, ${hash}, ${role})
      RETURNING id, name, email, wallet_address, bio, website, github, twitter,
                avatar, role, is_active, created_at, updated_at
    `
    return rows[0]
  },

  // ── Find by email (includes password for auth) ────────────
  async findByEmailWithPassword(email) {
    const rows = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()} AND is_active = TRUE LIMIT 1
    `
    return rows[0] || null
  },

  // ── Find by ID (no password) ──────────────────────────────
  async findById(id) {
    const rows = await sql`
      SELECT id, name, email, wallet_address, bio, website, github, twitter,
             avatar, role, is_active, created_at, updated_at
      FROM users WHERE id = ${id} AND is_active = TRUE LIMIT 1
    `
    return rows[0] || null
  },

  // ── Find by email (no password) ───────────────────────────
  async findByEmail(email) {
    const rows = await sql`
      SELECT id, name, email, wallet_address, bio, website, github, twitter,
             avatar, role, is_active, created_at, updated_at
      FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `
    return rows[0] || null
  },

  // ── Update profile ────────────────────────────────────────
  async updateProfile(id, { name, bio, website, github, twitter, walletAddress }) {
    const rows = await sql`
      UPDATE users SET
        name           = COALESCE(${name ?? null},          name),
        bio            = COALESCE(${bio ?? null},           bio),
        website        = COALESCE(${website ?? null},       website),
        github         = COALESCE(${github ?? null},        github),
        twitter        = COALESCE(${twitter ?? null},       twitter),
        wallet_address = COALESCE(${walletAddress ?? null}, wallet_address),
        updated_at     = NOW()
      WHERE id = ${id}
      RETURNING id, name, email, wallet_address, bio, website, github, twitter,
                avatar, role, is_active, created_at, updated_at
    `
    return rows[0] || null
  },

  // ── Change password ───────────────────────────────────────
  async changePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12)
    await sql`UPDATE users SET password = ${hash}, updated_at = NOW() WHERE id = ${id}`
    return true
  },

  // ── Compare password ──────────────────────────────────────
  async comparePassword(plainText, hash) {
    return bcrypt.compare(plainText, hash)
  },

  // ── Deactivate account ────────────────────────────────────
  async deactivate(id) {
    await sql`UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ${id}`
    return true
  },
}

module.exports = User
