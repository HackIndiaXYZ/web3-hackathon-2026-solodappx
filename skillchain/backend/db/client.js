const { neon } = require('@neondatabase/serverless')
const { drizzle } = require('drizzle-orm/neon-http')
const schema = require('./schema')

// Validate env
if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set. Add it to your .env file.')
  process.exit(1)
}

// Create Neon HTTP client (serverless-compatible, no persistent connection needed)
const sql = neon(process.env.DATABASE_URL)

// Create Drizzle ORM instance with full schema
const db = drizzle(sql, { schema })

module.exports = { db, sql }
