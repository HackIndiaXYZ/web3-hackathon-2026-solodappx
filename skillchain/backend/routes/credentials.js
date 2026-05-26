const express = require('express')
const { body, validationResult } = require('express-validator')
const Credential = require('../models/Credential')
const { protect, optionalAuth } = require('../middleware/auth')
const { simulateBlockchainWrite } = require('../utils/blockchain')
const { createNotification } = require('./notifications')
const { recordTransaction } = require('./transactions')

const router = express.Router()
const shortAddr = (a) => a ? `${a.slice(0,6)}...${a.slice(-4)}` : ''

// GET /api/credentials — list mine
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const list  = await Credential.findByIssuer(req.user.id, { status, category, limit: parseInt(limit), offset })
    const total = await Credential.countByIssuer(req.user.id, { status })
    const stats = await Credential.getStats(req.user.id)

    res.json({ success: true, credentials: list, total, page: parseInt(page), stats })
  } catch (err) {
    console.error('Fetch credentials:', err)
    res.status(500).json({ message: 'Failed to fetch credentials' })
  }
})

// POST /api/credentials/issue
router.post('/issue', protect,
  [
    body('recipientAddress').matches(/^0x[0-9a-fA-F]{40}$/).withMessage('Invalid Ethereum address'),
    body('skillName').trim().isLength({ min: 2, max: 100 }).withMessage('Skill name must be 2-100 characters'),
    body('level').isInt({ min: 1, max: 5 }).withMessage('Level must be 1-5'),
    body('category').isIn(['blockchain','development','design','data-science','cybersecurity','ai-ml','cloud','devops','other']).withMessage('Invalid category'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const { recipientAddress, recipientName, skillName, category, level, description, expiresAt, issuerAddress } = req.body

      const blockchainData = await simulateBlockchainWrite({
        recipientAddress, skillName, level,
        issuerAddress: issuerAddress || req.user.wallet_address,
      })

      const credential = await Credential.create({
        skillName, category, level: parseInt(level), description,
        recipientAddress, recipientName,
        issuerAddress: issuerAddress || req.user.wallet_address || '0x0000000000000000000000000000000000000000',
        issuerName: req.user.name,
        issuerUserId: req.user.id,
        expiresAt: expiresAt || null,
        status: 'verified',
        txHash:       blockchainData.txHash,
        blockNumber:  blockchainData.blockNumber,
        onChainId:    blockchainData.credentialId,
        isPublic: true,
      })

      res.status(201).json({ success: true, credential, blockchain: blockchainData })

      // Fire-and-forget: record tx + notification
      recordTransaction(req.user.id, {
        type: 'credential_issue',
        txHash: blockchainData.txHash,
        blockNumber: blockchainData.blockNumber,
        fromAddress: issuerAddress || req.user.wallet_address || '',
        toAddress: recipientAddress,
        description: `Issued credential: ${skillName}`,
        credentialId: credential.id,
      }).catch(() => {})

      createNotification(req.user.id, {
        type: 'credential_issued',
        title: 'Credential Issued',
        message: `Successfully issued "${skillName}" credential to ${recipientName || shortAddr(recipientAddress)}`,
        data: { credentialId: credential.id, txHash: blockchainData.txHash },
      }).catch(() => {})
    } catch (err) {
      console.error('Issue credential:', err)
      res.status(500).json({ message: err.message || 'Failed to issue credential' })
    }
  }
)

// GET /api/credentials/verify/:id — public
router.get('/verify/:id', optionalAuth, async (req, res) => {
  try {
    const credential = await Credential.findByAnyId(req.params.id)

    if (!credential) {
      return res.status(404).json({ success: false, isValid: false, message: 'Credential not found' })
    }

    const isExpired = credential.expires_at && new Date() > new Date(credential.expires_at)
    const isValid   = credential.status === 'verified' && !isExpired

    res.json({
      success: true,
      isValid,
      credential,
      verifiedAt: new Date().toISOString(),
      message: isValid ? 'Credential is valid and active on Polygon'
               : isExpired ? 'Credential has expired'
               : `Credential status: ${credential.status}`,
    })
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' })
  }
})

// GET /api/credentials/public/:address — public
router.get('/public/:address', async (req, res) => {
  try {
    const { address } = req.params
    if (!/^0x[0-9a-fA-F]{40}$/.test(address))
      return res.status(400).json({ message: 'Invalid Ethereum address' })

    const credentials = await Credential.findPublicByAddress(address)
    res.json({ success: true, credentials, address })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch public credentials' })
  }
})

// GET /api/credentials/:id — single (mine)
router.get('/:id', protect, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id)
    if (!credential || credential.issuer_user_id !== req.user.id)
      return res.status(404).json({ message: 'Credential not found' })
    res.json({ success: true, credential })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch credential' })
  }
})

// PUT /api/credentials/:id/revoke
router.put('/:id/revoke', protect, async (req, res) => {
  try {
    const existing = await Credential.findById(req.params.id)
    if (!existing || existing.issuer_user_id !== req.user.id)
      return res.status(404).json({ message: 'Credential not found or not your credential' })
    if (existing.status === 'revoked')
      return res.status(400).json({ message: 'Already revoked' })

    const credential = await Credential.revoke(req.params.id, req.user.id, req.body.reason)
    res.json({ success: true, credential })
  } catch (err) {
    res.status(500).json({ message: 'Revocation failed' })
  }
})

// DELETE /api/credentials/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Credential.delete(req.params.id, req.user.id)
    if (!deleted) return res.status(404).json({ message: 'Credential not found' })
    res.json({ success: true, message: 'Credential deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router
