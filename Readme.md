
# SkillChain — Decentralized Skills & Credentials on Polygon

SkillChain lets you issue, verify, and share tamper-proof skill credentials anchored to the Polygon blockchain. Every credential gets a blockchain transaction hash, a shareable verify link, and a QR code.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js, Express, Neon PostgreSQL (serverless), Drizzle ORM |
| Blockchain | Polygon Amoy Testnet, ethers.js, Hardhat |
| AI | OpenAI GPT-4 |

---

## Project Structure

```
skillchain/
├── backend/          # Express API server
│   ├── db/           # Neon PostgreSQL client + migrations
│   ├── middleware/   # JWT auth
│   ├── models/       # User, Credential, ChatHistory
│   ├── routes/       # auth, credentials, ai, notifications, transactions, stats, upload
│   └── utils/        # blockchain helpers
├── frontend/         # React + Vite app
│   ├── public/       # favicon.svg
│   └── src/
│       ├── components/  # Layout, Navbar, Sidebar, CredentialCard, Modals
│       ├── pages/       # All page components
│       ├── store/       # Redux slices
│       └── utils/       # api.js, helpers.js
└── contracts/        # Solidity smart contracts (Hardhat)
```

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- An OpenAI API key
- MetaMask browser extension (for wallet features)

---

## Setup & Run

### 1. Clone / unzip the project

```bash
cd skillchain
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env` (copy from `.env.example`):

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
OPENAI_API_KEY=sk-...
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run the backend (auto-migrates DB on first start):

```bash
npm run dev
```

The API will be live at `http://localhost:5000`. You should see:

```
✅ Database ready
🚀 SkillChain API → http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_POLYGON_RPC=https://rpc-amoy.polygon.technology
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

Run the frontend:

```bash
npm run dev
```

App is live at `http://localhost:5173`.

---

## Features

### ✅ Credential Management
- Issue credentials with skill name, category, level, recipient wallet address
- Every credential gets a blockchain tx hash (simulated on Amoy testnet)
- Revoke credentials with a reason

### ✅ Transaction History (`/transactions`)
- Real on-chain operations stored in Neon DB
- Each credential issue automatically records a transaction
- Links to PolygonScan for every tx hash

### ✅ QR Code Verify
- Each credential card has a share link (`/verify/<credential-id>`)
- VerifyPage auto-verifies when opened via QR scan
- Profile page shows a QR code for your public profile URL

### ✅ Credential Share Link
- Each credential card has a copy-link button (🔗)
- Copies `https://yourapp.com/verify/<id>` to clipboard

### ✅ Public Profile Page (`/public/:address`)
- View any wallet address's public credentials
- Search by entering any 0x... Ethereum address
- No login required

### ✅ Notification Bell
- Real notifications stored in Neon DB
- Auto-polls every 30 seconds
- Mark all read, clear read notifications
- Notifications fire on credential issue

### ✅ Dashboard Stats
- Stats loaded from separate `/api/stats/dashboard` call
- Includes real monthly activity chart (6 months)
- Transaction count included

### ✅ Avatar Upload
- Click your avatar to upload a photo (JPEG/PNG/WebP, max 2MB)
- Stored as base64 in the database
- Remove photo option

### ✅ favicon.svg
- Gradient shield icon at `frontend/public/favicon.svg`

### ✅ Third-party API Embed
- Profile page shows copy-ready fetch() snippets for:
  - Fetching all public credentials for a wallet
  - Verifying a specific credential by ID

### ✅ Dependencies Fixed
- `react-markdown` ✓ in package.json
- `qrcode.react` ✓ in package.json

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Get profile |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/credentials` | JWT | My credentials |
| POST | `/api/credentials/issue` | JWT | Issue credential |
| GET | `/api/credentials/verify/:id` | — | Verify credential (public) |
| GET | `/api/credentials/public/:address` | — | Public credentials by wallet |
| PUT | `/api/credentials/:id/revoke` | JWT | Revoke credential |
| GET | `/api/notifications` | JWT | List notifications |
| POST | `/api/notifications/mark-read` | JWT | Mark read |
| GET | `/api/transactions` | JWT | Transaction history |
| GET | `/api/stats/dashboard` | JWT | Dashboard stats |
| POST | `/api/upload/avatar` | JWT | Upload avatar |
| DELETE | `/api/upload/avatar` | JWT | Remove avatar |

---

## Smart Contract (optional)

The contracts directory contains the Solidity source. To deploy to Amoy testnet:

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
```

Add the deployed address to your frontend `.env` as `VITE_CONTRACT_ADDRESS`.

---

## Build for Production

```bash
# Frontend
cd frontend && npm run build   # outputs to frontend/dist/

# Backend
cd backend && NODE_ENV=production node server.js
```
