const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Access denied. No token provided.' })

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me')
    } catch (err) {
      return res.status(401).json({
        message: err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token.',
      })
    }

    const user = await User.findById(decoded.id)
    if (!user)          return res.status(401).json({ message: 'User not found.' })
    if (!user.is_active) return res.status(401).json({ message: 'Account deactivated.' })

    req.user = user   // Neon rows use snake_case: user.id, user.is_active, etc.
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ message: 'Authentication error.' })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()
    const token  = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me')
    const user   = await User.findById(decoded.id)
    if (user?.is_active) req.user = user
  } catch { /* ignore */ }
  next()
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' })
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Required role: ${roles.join(' or ')}` })
  next()
}

const generateToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

module.exports = { protect, optionalAuth, requireRole, generateToken }
