const express = require('express')
const { protect } = require('../middleware/auth')
const { sql } = require('../db/client')

const router = express.Router()

// GET /api/stats/dashboard — aggregated dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id

    const [credStats] = await sql`
      SELECT
        COUNT(*)::int                                            AS total,
        COUNT(*) FILTER (WHERE status = 'verified')::int        AS verified,
        COUNT(*) FILTER (WHERE status = 'pending')::int         AS pending,
        COUNT(*) FILTER (WHERE status = 'revoked')::int         AS revoked,
        COUNT(*) FILTER (WHERE expires_at < NOW() AND expires_at IS NOT NULL)::int AS expired
      FROM credentials WHERE issuer_user_id = ${userId}
    `

    // Monthly activity for the last 6 months
    const monthly = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        COUNT(*)::int AS credentials
      FROM credentials
      WHERE issuer_user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `

    // Category breakdown
    const categories = await sql`
      SELECT category, COUNT(*)::int AS count
      FROM credentials
      WHERE issuer_user_id = ${userId}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 6
    `

    // Recent transactions count
    const [txStats] = await sql`
      SELECT COUNT(*)::int AS total FROM transactions WHERE user_id = ${userId}
    `

    res.json({
      success: true,
      stats: {
        ...credStats,
        transactions: txStats?.total || 0,
      },
      monthly,
      categories,
    })
  } catch (err) {
    console.error('Fetch stats:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

module.exports = router
