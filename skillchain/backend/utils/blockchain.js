const { ethers } = require('ethers')
const crypto = require('crypto')

/**
 * Simulate a blockchain write (used in dev/when no private key configured)
 * In production, this calls the actual smart contract
 */
const simulateBlockchainWrite = async ({ recipientAddress, skillName, level, issuerAddress }) => {
  // Generate deterministic-looking mock data
  const raw = `${recipientAddress}${skillName}${level}${Date.now()}`
  const txHash = `0x${crypto.createHash('sha256').update(raw + 'tx').digest('hex')}`
  const credentialId = `0x${crypto.createHash('sha256').update(raw + 'id').digest('hex')}`
  const blockNumber = Math.floor(47000000 + Math.random() * 1000000)

  // If we have a configured provider + contract, use the real contract
  if (process.env.PRIVATE_KEY && process.env.CONTRACT_ADDRESS && process.env.POLYGON_RPC_URL) {
    try {
      return await writeToBlockchain({ recipientAddress, skillName, level, issuerAddress })
    } catch (err) {
      console.warn('Real blockchain write failed, using simulation:', err.message)
    }
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    txHash,
    blockNumber,
    credentialId,
    gasUsed: '85432',
    network: 'Polygon Amoy (Simulated)',
    simulated: true,
  }
}

/**
 * Real blockchain write using ethers.js + deployed contract
 */
const writeToBlockchain = async ({ recipientAddress, skillName, level }) => {
  const SKILLCHAIN_ABI = [
    "function issueCredential(address recipient, string memory metadataHash, string memory skillName, uint8 level) external returns (bytes32)",
    "event CredentialIssued(bytes32 indexed credentialId, address indexed recipient, address indexed issuer, string metadataHash, uint256 timestamp)",
  ]

  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, SKILLCHAIN_ABI, signer)

  // Generate metadata hash
  const metadataHash = `0x${crypto.createHash('sha256').update(
    JSON.stringify({ skillName, recipientAddress, level, issuedAt: Date.now() })
  ).digest('hex')}`

  const tx = await contract.issueCredential(
    recipientAddress,
    metadataHash,
    skillName,
    level,
    { gasLimit: 150000 }
  )

  const receipt = await tx.wait()

  // Parse event
  const event = receipt.logs
    .map(log => { try { return contract.interface.parseLog(log) } catch { return null } })
    .find(e => e?.name === 'CredentialIssued')

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    credentialId: event?.args?.credentialId || null,
    gasUsed: receipt.gasUsed.toString(),
    network: 'Polygon Amoy',
    simulated: false,
  }
}

/**
 * Verify a credential on-chain
 */
const verifyOnChain = async (credentialId) => {
  if (!process.env.POLYGON_RPC_URL || !process.env.CONTRACT_ADDRESS) {
    return { verified: true, onChain: false, message: 'On-chain verification not configured' }
  }

  try {
    const VERIFY_ABI = [
      "function verifyCredential(bytes32 credentialId) external view returns (bool isValid, address recipient, address issuer, string memory metadataHash, uint256 issuedAt, bool revoked)",
    ]

    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, VERIFY_ABI, provider)
    const result = await contract.verifyCredential(credentialId)

    return {
      verified: result.isValid && !result.revoked,
      onChain: true,
      recipient: result.recipient,
      issuer: result.issuer,
      issuedAt: new Date(Number(result.issuedAt) * 1000).toISOString(),
      revoked: result.revoked,
    }
  } catch (err) {
    console.error('On-chain verify error:', err.message)
    return { verified: false, onChain: true, error: err.message }
  }
}

module.exports = { simulateBlockchainWrite, writeToBlockchain, verifyOnChain }
