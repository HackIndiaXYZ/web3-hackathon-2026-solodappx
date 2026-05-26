const { pgTable, text, varchar, integer, boolean, timestamp, serial, uuid, pgEnum } = require('drizzle-orm/pg-core')

// ── Enums ─────────────────────────────────────────────────────
const userRoleEnum = pgEnum('user_role', ['user', 'issuer', 'admin'])

const credentialStatusEnum = pgEnum('credential_status', ['pending', 'verified', 'revoked'])

const credentialCategoryEnum = pgEnum('credential_category', [
  'blockchain', 'development', 'design', 'data-science',
  'cybersecurity', 'ai-ml', 'cloud', 'devops', 'other'
])

const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant'])

// ── users ─────────────────────────────────────────────────────
const users = pgTable('users', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          varchar('name', { length: 50 }).notNull(),
  email:         varchar('email', { length: 255 }).notNull().unique(),
  password:      text('password').notNull(),          // bcrypt hash
  walletAddress: varchar('wallet_address', { length: 42 }).unique(),
  bio:           text('bio').default(''),
  website:       text('website').default(''),
  github:        varchar('github', { length: 100 }).default(''),
  twitter:       varchar('twitter', { length: 100 }).default(''),
  avatar:        text('avatar').default(''),
  role:          userRoleEnum('role').default('user').notNull(),
  isActive:      boolean('is_active').default(true).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})

// ── credentials ───────────────────────────────────────────────
const credentials = pgTable('credentials', {
  id:               uuid('id').primaryKey().defaultRandom(),
  credentialId:     varchar('credential_id', { length: 100 }).notNull().unique(),  // sc_<uuid>
  skillName:        varchar('skill_name', { length: 100 }).notNull(),
  category:         credentialCategoryEnum('category').notNull().default('development'),
  level:            integer('level').notNull().default(3),          // 1–5
  description:      text('description').default(''),

  // Recipient
  recipientAddress: varchar('recipient_address', { length: 42 }).notNull(),
  recipientName:    varchar('recipient_name', { length: 100 }).default(''),
  recipientUserId:  uuid('recipient_user_id').references(() => users.id, { onDelete: 'set null' }),

  // Issuer
  issuerAddress:    varchar('issuer_address', { length: 42 }).default(''),
  issuerName:       varchar('issuer_name', { length: 100 }).default(''),
  issuerUserId:     uuid('issuer_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Validity
  issuedAt:         timestamp('issued_at').defaultNow().notNull(),
  expiresAt:        timestamp('expires_at'),

  // Status
  status:           credentialStatusEnum('status').default('pending').notNull(),

  // Blockchain data
  txHash:           varchar('tx_hash', { length: 66 }),
  blockNumber:      integer('block_number'),
  metadataHash:     varchar('metadata_hash', { length: 68 }),  // 0x + 64 hex
  onChainId:        varchar('on_chain_id', { length: 68 }),

  // Revocation
  revokedAt:        timestamp('revoked_at'),
  revokedBy:        uuid('revoked_by').references(() => users.id, { onDelete: 'set null' }),
  revocationReason: text('revocation_reason').default(''),

  isPublic:         boolean('is_public').default(true).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
})

// ── chat_history (one row per user — the session container) ───
const chatHistory = pgTable('chat_history', {
  id:           uuid('id').primaryKey().defaultRandom(),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  totalMessages:integer('total_messages').default(0).notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

// ── chat_messages (individual messages, FK to chat_history) ───
const chatMessages = pgTable('chat_messages', {
  id:            uuid('id').primaryKey().defaultRandom(),
  chatHistoryId: uuid('chat_history_id').references(() => chatHistory.id, { onDelete: 'cascade' }).notNull(),
  userId:        uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role:          chatRoleEnum('role').notNull(),
  content:       text('content').notNull(),
  tokens:        integer('tokens').default(0),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

module.exports = {
  users,
  credentials,
  chatHistory,
  chatMessages,
  // Enums (exported for query building)
  userRoleEnum,
  credentialStatusEnum,
  credentialCategoryEnum,
  chatRoleEnum,
}
