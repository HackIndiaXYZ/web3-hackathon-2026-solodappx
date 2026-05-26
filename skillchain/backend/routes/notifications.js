const express = require('express')
const { protect } = require('../middleware/auth')
const { sql } = require('../db/client')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

// GET /api/notifications — list mine
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 30, unread_only } = req.query
    const unreadClause = unread_only === 'true' ? sql`AND is_read = FALSE` : sql``

    const rows = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${req.user.id}
      ${unreadClause}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
    `
    const unreadCount = await sql`
      SELECT COUNT(*)::int AS count FROM notifications
      WHERE user_id = ${req.user.id} AND is_read = FALSE
    `
    res.json({ success: true, notifications: rows, unreadCount: unreadCount[0].count })
  } catch (err) {
    console.error('Fetch notifications:', err)
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// POST /api/notifications/mark-read
router.post('/mark-read', protect, async (req, res) => {
  try {
    const { ids } = req.body // array of UUIDs, or empty to mark all
    if (ids && ids.length > 0) {
      await sql`
        UPDATE notifications SET is_read = TRUE
        WHERE user_id = ${req.user.id} AND id = ANY(${ids}::uuid[])
      `
    } else {
      await sql`
        UPDATE notifications SET is_read = TRUE WHERE user_id = ${req.user.id}
      `
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications read' })
  }
})

// DELETE /api/notifications/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await sql`DELETE FROM notifications WHERE user_id = ${req.user.id} AND is_read = TRUE`
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications' })
  }
})

// Internal helper — used by credential routes to create notifications
const createNotification = async (userId, { type = 'info', title, message, data = {} }) => {
  try {
    await sql`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (${uuidv4()}, ${userId}, ${type}, ${title}, ${message}, ${JSON.stringify(data)})
    `
  } catch (err) {
    console.error('Create notification failed:', err.message)
  }
}

module.exports = router
module.exports.createNotification = createNotification
