/**
 * models/Credential.js
 * All credential queries using Neon PostgreSQL.
 */

const { sql } = require('../db/client')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const Credential = {
  // ── Generate credential ID + metadata hash ─────────────────
  _makeCredentialId: () => `sc_${uuidv4().replace(/-/g, '')}`,

  _makeMetadataHash: ({ credentialId, skillName, recipientAddress, issuerAddress, issuedAt }) => {
    const raw = JSON.stringify({ credentialId, skillName, recipientAddress, issuerAddress, issuedAt })
    return `0x${crypto.createHash('sha256').update(raw).digest('hex')}`
  },

  // ── Create / Issue ────────────────────────────────────────
  async create({
    skillName, category = 'development', level = 3, description = '',
    recipientAddress, recipientName = '', recipientUserId = null,
    issuerAddress = '', issuerName = '', issuerUserId,
    expiresAt = null, status = 'pending',
    txHash = null, blockNumber = null, onChainId = null,
    isPublic = true,
  }) {
    const credentialId = this._makeCredentialId()
    const issuedAt = new Date()
    const metadataHash = this._makeMetadataHash({
      credentialId, skillName,
      recipientAddress: recipientAddress.toLowerCase(),
      issuerAddress: issuerAddress.toLowerCase(),
      issuedAt,
    })

    const rows = await sql`
      INSERT INTO credentials (
        id, credential_id, skill_name, category, level, description,
        recipient_address, recipient_name, recipient_user_id,
        issuer_address, issuer_name, issuer_user_id,
        issued_at, expires_at, status,
        tx_hash, block_number, metadata_hash, on_chain_id, is_public
      ) VALUES (
        ${uuidv4()}, ${credentialId},
        ${skillName.trim()}, ${category}, ${level}, ${description},
        ${recipientAddress.toLowerCase()}, ${recipientName}, ${recipientUserId},
        ${issuerAddress.toLowerCase()}, ${issuerName}, ${issuerUserId},
        ${issuedAt}, ${expiresAt}, ${status},
        ${txHash}, ${blockNumber}, ${metadataHash}, ${onChainId}, ${isPublic}
      )
      RETURNING *
    `
    return rows[0]
  },

  // ── Find all by issuer ────────────────────────────────────
  async findByIssuer(issuerUserId, { status, category, limit = 20, offset = 0 } = {}) {
    // Build conditional filters
    const statusClause  = status   ? sql`AND status   = ${status}`   : sql``
    const categoryClause = category ? sql`AND category = ${category}` : sql``

    const rows = await sql`
      SELECT * FROM credentials
      WHERE issuer_user_id = ${issuerUserId}
      ${statusClause}
      ${categoryClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return rows
  },

  // ── Count by issuer ───────────────────────────────────────
  async countByIssuer(issuerUserId, filters = {}) {
    const statusClause = filters.status ? sql`AND status = ${filters.status}` : sql``
    const rows = await sql`
      SELECT COUNT(*)::int AS total FROM credentials
      WHERE issuer_user_id = ${issuerUserId} ${statusClause}
    `
    return rows[0].total
  },

  // ── Find one by ID (Postgres UUID) ───────────────────────
  async findById(id) {
    const rows = await sql`SELECT * FROM credentials WHERE id = ${id} LIMIT 1`
    return rows[0] || null
  },

  // ── Find by credentialId string (sc_xxxx) or txHash ──────
  async findByCredentialIdOrTxHash(identifier) {
    const rows = await sql`
      SELECT * FROM credentials
      WHERE credential_id = ${identifier}
         OR tx_hash        = ${identifier}
      LIMIT 1
    `
    return rows[0] || null
  },

  // ── Also try UUID match (for _id-style lookups) ───────────
  async findByAnyId(id) {
    // Try UUID first, then credential_id, then tx_hash
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (isUUID) {
      const byId = await sql`SELECT * FROM credentials WHERE id = ${id} LIMIT 1`
      if (byId[0]) return byId[0]
    }
    return this.findByCredentialIdOrTxHash(id)
  },

  // ── Public credentials for a wallet ──────────────────────
  async findPublicByAddress(recipientAddress) {
    const rows = await sql`
      SELECT * FROM credentials
      WHERE recipient_address = ${recipientAddress.toLowerCase()}
        AND is_public = TRUE
        AND status    = 'verified'
      ORDER BY issued_at DESC
    `
    return rows
  },

  // ── Revoke ────────────────────────────────────────────────
  async revoke(id, revokedBy, reason = 'Revoked by issuer') {
    const rows = await sql`
      UPDATE credentials
      SET status            = 'revoked',
          revoked_at        = NOW(),
          revoked_by        = ${revokedBy},
          revocation_reason = ${reason},
          updated_at        = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return rows[0] || null
  },

  // ── Update blockchain data after tx confirms ──────────────
  async updateBlockchainData(id, { txHash, blockNumber, onChainId, status = 'verified' }) {
    const rows = await sql`
      UPDATE credentials
      SET tx_hash      = ${txHash},
          block_number = ${blockNumber},
          on_chain_id  = ${onChainId},
          status       = ${status},
          updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return rows[0] || null
  },

  // ── Delete ────────────────────────────────────────────────
  async delete(id, issuerUserId) {
    const rows = await sql`
      DELETE FROM credentials
      WHERE id = ${id} AND issuer_user_id = ${issuerUserId}
      RETURNING id
    `
    return rows[0] || null
  },

  // ── Stats for a user ──────────────────────────────────────
  async getStats(issuerUserId) {
    const rows = await sql`
      SELECT
        COUNT(*)                              AS total,
        COUNT(*) FILTER (WHERE status = 'verified') AS verified,
        COUNT(*) FILTER (WHERE status = 'pending')  AS pending,
        COUNT(*) FILTER (WHERE status = 'revoked')  AS revoked
      FROM credentials
      WHERE issuer_user_id = ${issuerUserId}
    `
    const r = rows[0]
    return {
      total:    parseInt(r.total),
      verified: parseInt(r.verified),
      pending:  parseInt(r.pending),
      revoked:  parseInt(r.revoked),
    }
  },
}

module.exports = Credential
