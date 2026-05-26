const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect, generateToken } = require('../middleware/auth')

const router = express.Router()

const sendToken = (res, user, status = 200) => {
  const token = generateToken(user.id)
  // Remove password just in case
  const { password, ...safeUser } = user
  res.status(status).json({ success: true, token, user: safeUser })
}

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { name, email, password } = req.body
      const existing = await User.findByEmail(email)
      if (existing) return res.status(409).json({ message: 'Email already registered' })

      const user = await User.create({ name, email, password })
      sendToken(res, user, 201)
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ message: 'Registration failed' })
    }
  }
)

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { email, password } = req.body
      const user = await User.findByEmailWithPassword(email)
      if (!user) return res.status(401).json({ message: 'Invalid email or password' })

      const valid = await User.comparePassword(password, user.password)
      if (!valid) return res.status(401).json({ message: 'Invalid email or password' })
      if (!user.is_active) return res.status(401).json({ message: 'Account deactivated' })

      const { password: _pw, ...safeUser } = user
      sendToken(res, safeUser)
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({ message: 'Login failed' })
    }
  }
)

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, website, github, twitter, walletAddress } = req.body
    const user = await User.updateProfile(req.user.id, { name, bio, website, github, twitter, walletAddress })
    res.json({ success: true, user })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ message: 'Profile update failed' })
  }
})

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' })

    const user = await User.findByEmailWithPassword(req.user.email)
    const valid = await User.comparePassword(currentPassword, user.password)
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' })

    await User.changePassword(req.user.id, newPassword)
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Password change failed' })
  }
})

module.exports = router
