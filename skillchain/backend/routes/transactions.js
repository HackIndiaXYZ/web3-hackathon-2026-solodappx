const express = require('express')
const { protect } = require('../middleware/auth')
const { sql } = require('../db/client')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

// GET /api/transactions — list mine
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const rows = await sql`
      SELECT t.*, c.skill_name, c.category, c.credential_id AS cred_string_id
      FROM transactions t
      LEFT JOIN credentials c ON c.id = t.credential_id
      WHERE t.user_id = ${req.user.id}
      ORDER BY t.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${offset}
    `
    const total = await sql`
      SELECT COUNT(*)::int AS total FROM transactions WHERE user_id = ${req.user.id}
    `
    res.json({ success: true, transactions: rows, total: total[0].total, page: parseInt(page) })
  } catch (err) {
    console.error('Fetch transactions:', err)
    res.status(500).json({ message: 'Failed to fetch transactions' })
  }
})

// Internal helper — record a transaction
const recordTransaction = async (userId, {
  type = 'credential_issue', txHash, blockNumber = null,
  fromAddress = '', toAddress = '', value = '0',
  status = 'confirmed', description = '', credentialId = null,
}) => {
  try {
    await sql`
      INSERT INTO transactions (id, user_id, type, tx_hash, block_number, from_address, to_address, value, status, description, credential_id)
      VALUES (${uuidv4()}, ${userId}, ${type}, ${txHash}, ${blockNumber}, ${fromAddress}, ${toAddress}, ${value}, ${status}, ${description}, ${credentialId})
    `
  } catch (err) {
    console.error('Record transaction failed:', err.message)
  }
}

module.exports = router
module.exports.recordTransaction = recordTransaction
