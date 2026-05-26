require('dotenv').config()

// Suppress noisy deprecation warnings from dependencies
process.removeAllListeners('warning')

const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')
const { migrate } = require('./db/migrate')

const authRoutes         = require('./routes/auth')
const credentialRoutes   = require('./routes/credentials')
const aiRoutes           = require('./routes/ai')
const notificationRoutes = require('./routes/notifications')
const transactionRoutes  = require('./routes/transactions')
const statsRoutes        = require('./routes/stats')
const uploadRoutes       = require('./routes/upload')

const app  = express()
const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// ── Security ──────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
}))
app.use('/api/ai', rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: false,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please wait a moment.' },
}))

// ── Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/credentials',  credentialRoutes)
app.use('/api/ai',           aiRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/transactions',  transactionRoutes)
app.use('/api/stats',         statsRoutes)
app.use('/api/upload',        uploadRoutes)

app.get('/api/health', (_req, res) => res.json({
  status: 'operational',
  service: 'SkillChain API v1.0',
  database: 'Neon PostgreSQL',
  timestamp: new Date().toISOString(),
}))

app.use('*', (_req, res) => res.status(404).json({ message: 'Route not found' }))

app.use((err, _req, res, _next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    message: isProd ? 'Internal server error' : err.message,
  })
})

// ── Start ─────────────────────────────────────────────────────
const start = async () => {
  try {
    process.stdout.write('🔄 Setting up database...\n')
    await migrate()
    process.stdout.write('✅ Database ready\n\n')

    app.listen(PORT, () => {
      console.log(`🚀 SkillChain API   →  http://localhost:${PORT}`)
      console.log(`🗄️  Database        →  Neon PostgreSQL`)
      console.log(`📡 Environment     →  ${process.env.NODE_ENV || 'development'}`)
      console.log(`\n   API Health: http://localhost:${PORT}/api/health\n`)
    })
  } catch (err) {
    console.error('❌ Startup failed:', err.message)
    process.exit(1)
  }
}

start()
module.exports = app
