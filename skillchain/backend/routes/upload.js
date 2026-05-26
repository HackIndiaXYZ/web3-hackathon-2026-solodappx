const express = require('express')
const { protect } = require('../middleware/auth')
const { sql } = require('../db/client')

const router = express.Router()

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB limit for base64 image

// POST /api/upload/avatar — accept base64 data URL, store in users.avatar
router.post('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body

    if (!avatar) return res.status(400).json({ message: 'No avatar data provided' })

    // Validate it's a valid base64 image data URL
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Must be a data URL (data:image/...)' })
    }

    const allowedTypes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp', 'data:image/gif']
    const isAllowed = allowedTypes.some(t => avatar.startsWith(t))
    if (!isAllowed) {
      return res.status(400).json({ message: 'Unsupported image type. Use JPEG, PNG, WebP, or GIF.' })
    }

    // Rough size check on the base64 string
    const approxBytes = (avatar.length * 3) / 4
    if (approxBytes > MAX_SIZE) {
      return res.status(400).json({ message: 'Image too large. Maximum size is 2MB.' })
    }

    const rows = await sql`
      UPDATE users SET avatar = ${avatar}, updated_at = NOW()
      WHERE id = ${req.user.id}
      RETURNING id, name, email, wallet_address, bio, website, github, twitter, avatar, role, is_active, created_at, updated_at
    `

    res.json({ success: true, user: rows[0], message: 'Avatar updated successfully' })
  } catch (err) {
    console.error('Upload avatar error:', err)
    res.status(500).json({ message: 'Avatar upload failed' })
  }
})

// DELETE /api/upload/avatar — remove avatar
router.delete('/avatar', protect, async (req, res) => {
  try {
    const rows = await sql`
      UPDATE users SET avatar = '', updated_at = NOW()
      WHERE id = ${req.user.id}
      RETURNING id, name, email, wallet_address, bio, website, github, twitter, avatar, role, is_active, created_at, updated_at
    `
    res.json({ success: true, user: rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove avatar' })
  }
})

module.exports = router
