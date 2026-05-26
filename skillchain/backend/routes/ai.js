const express   = require('express')
const OpenAI    = require('openai')
const ChatHistory = require('../models/ChatHistory')
const { protect } = require('../middleware/auth')

const router = express.Router()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are SkillChain AI, an expert assistant for the SkillChain decentralized credentials platform built on Polygon blockchain.

Your expertise covers:
- Blockchain credentials and verifiable credentials (VCs)
- Polygon blockchain, smart contracts (Solidity), and Web3 concepts
- How to issue, verify, and revoke credentials on SkillChain
- ethers.js, MetaMask, DApp development
- DeFi, NFTs, DAOs, digital identity (SSI, DIDs)
- Career advice for Web3 developers

Guidelines:
- Be concise but thorough. Use bullet points for lists.
- Format code with proper markdown fenced code blocks.
- Encourage Web3 skill development.
- Don't invent specific transaction data or addresses.`

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' })

    // Get recent messages for context
    const history = await ChatHistory.getRecentForContext(req.user.id, 8)

    let aiMessage, tokens = 0

    if (!process.env.OPENAI_API_KEY) {
      aiMessage = getMockResponse(message)
    } else {
      try {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message.trim() },
        ]

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        })
        aiMessage = completion.choices[0]?.message?.content || 'No response generated.'
        tokens    = completion.usage?.total_tokens || 0
      } catch (openaiErr) {
        console.warn('OpenAI error, using fallback:', openaiErr.message)
        aiMessage = getMockResponse(message)
      }
    }

    // Save both messages to Neon
    await ChatHistory.saveMessages(req.user.id, {
      userMessage: message.trim(),
      aiMessage,
      tokens,
    })

    res.json({ success: true, message: aiMessage, tokens })
  } catch (err) {
    console.error('AI chat error:', err)
    res.status(500).json({ message: 'AI service error' })
  }
})

// GET /api/ai/history
router.get('/history', protect, async (req, res) => {
  try {
    const messages = await ChatHistory.getMessages(req.user.id)
    res.json({ success: true, history: messages, total: messages.length })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history' })
  }
})

// DELETE /api/ai/history
router.delete('/history', protect, async (req, res) => {
  try {
    await ChatHistory.clearMessages(req.user.id)
    res.json({ success: true, message: 'Chat history cleared' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear history' })
  }
})

function getMockResponse(message) {
  const msg = message.toLowerCase()
  if (msg.includes('credential') || msg.includes('certif')) {
    return `## Credentials on SkillChain\n\nCredentials are issued as **on-chain records** on Polygon:\n\n- **Issue**: An issuer calls the smart contract with your wallet address + skill metadata\n- **Store**: A unique \`credentialId\` (bytes32 hash) is stored immutably on-chain\n- **Verify**: Anyone calls \`verifyCredential(id)\` — no permission needed\n- **Revoke**: Only the original issuer can revoke\n\nHead to **Credentials** to issue your first one!`
  }
  if (msg.includes('polygon') || msg.includes('blockchain')) {
    return `## Polygon Blockchain\n\nSkillChain uses **Polygon Amoy Testnet** because:\n\n- Low fees (~$0.001/tx)\n- Fast 2-second blocks\n- EVM-compatible (Solidity + MetaMask)\n\nGet free test MATIC: https://faucet.polygon.technology/`
  }
  if (msg.includes('metamask') || msg.includes('wallet')) {
    return `## Connecting MetaMask\n\n1. Install MetaMask from [metamask.io](https://metamask.io)\n2. Create wallet — save your seed phrase!\n3. SkillChain auto-prompts you to add **Polygon Amoy** (chainId 80002)\n4. Get test MATIC from the faucet\n5. Click **Connect Wallet** in SkillChain`
  }
  return `## SkillChain AI (Demo Mode)\n\nI'm your Web3 & blockchain credentials expert. Ask me about:\n\n- 🔗 Blockchain & Polygon\n- 📜 Issuing & verifying credentials\n- 💼 Solidity & smart contracts\n- 🦊 MetaMask & wallets\n\n*OpenAI API key not configured — running demo responses.*`
}

module.exports = router
