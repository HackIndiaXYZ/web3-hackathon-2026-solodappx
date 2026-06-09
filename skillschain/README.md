# ⛓️ SkillsChain v2.0 – Skills On-Chain Platform

> Decentralized skill credential issuance & verification on Polygon blockchain.
> **No database. No backend. No external APIs. No Hardhat. 100% frontend + blockchain.**

## 🚀 Quick Start (Only npm commands!)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Deploy your smart contract on Polygon Mumbai
- Go to https://remix.ethereum.org
- Paste the code from `contracts/SkillsChain.sol`
- Compile with Solidity 0.8.20
- Deploy using **Injected Provider (MetaMask)** on Polygon Mumbai
- Copy the deployed contract address

### 3. Update contract address
Edit `frontend/src/contract/abi.js`:
```js
export const CONTRACT_ADDRESS = "0xYourDeployedAddress";
```
Or set in `frontend/.env`:
```
VITE_CONTRACT_ADDRESS=0xYourDeployedAddress
```

### 4. Start the app
```bash
cd frontend
npm run dev
```
Open http://localhost:3000

## 🌐 Deploy to Render

1. Push to GitHub
2. Go to render.com → New → Static Site
3. Connect your repo
4. Build Command: `cd frontend && npm install && npm run build`
5. Publish Directory: `frontend/dist`
6. Add env var: `VITE_CONTRACT_ADDRESS` = your contract address
7. Click Create

## 📁 Project Structure

```
skillschain/
├── contracts/SkillsChain.sol      # Solidity (deploy via Remix)
├── README.md
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env
│   └── src/
│       ├── main.jsx               # Entry point
│       ├── App.jsx                # Router
│       ├── index.css              # Global styles
│       ├── components/            # Navbar, QRCodeDisplay
│       ├── context/               # WalletContext (MetaMask)
│       ├── contract/              # ABI + address
│       ├── pages/                 # All 6 pages
│       ├── sdk/                   # Third-party SDK
│       └── utils/                 # Helpers
└── render.yaml                    # Render deployment config
```

## ✨ Features

- ✅ Dark theme + glassmorphism + neon gradients
- ✅ MetaMask wallet connect
- ✅ Issue credentials on-chain
- ✅ View + verify credentials
- ✅ QR code generation
- ✅ Certificate download
- ✅ Fully responsive
- ✅ Framer Motion animations
- ✅ Third-party SDK
- ✅ No database, no backend, no APIs
