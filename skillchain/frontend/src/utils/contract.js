import { ethers } from 'ethers'

// ── SkillChain Contract ABI ───────────────────────────────────
// This matches the Solidity contract in /contracts/SkillChain.sol
export const SKILLCHAIN_ABI = [
  // Events
  "event CredentialIssued(bytes32 indexed credentialId, address indexed recipient, address indexed issuer, string metadataHash, uint256 timestamp)",
  "event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer, uint256 timestamp)",
  "event CredentialVerified(bytes32 indexed credentialId, address indexed verifier, uint256 timestamp)",

  // Functions
  "function issueCredential(address recipient, string memory metadataHash, string memory skillName, uint8 level) external returns (bytes32)",
  "function revokeCredential(bytes32 credentialId) external",
  "function verifyCredential(bytes32 credentialId) external view returns (bool isValid, address recipient, address issuer, string memory metadataHash, uint256 issuedAt, bool revoked)",
  "function getCredentialsByRecipient(address recipient) external view returns (bytes32[] memory)",
  "function getCredentialsByIssuer(address issuer) external view returns (bytes32[] memory)",
  "function totalCredentials() external view returns (uint256)",

  // Read-only
  "function credentials(bytes32) external view returns (address recipient, address issuer, string metadataHash, string skillName, uint8 level, uint256 issuedAt, bool revoked)",
  "function isAuthorizedIssuer(address) external view returns (bool)",
  "function owner() external view returns (address)",
]

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// ── Get contract instance ─────────────────────────────────────
export const getContract = async (withSigner = false) => {
  if (!window.ethereum) throw new Error('MetaMask not installed')

  const provider = new ethers.BrowserProvider(window.ethereum)

  if (withSigner) {
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, SKILLCHAIN_ABI, signer)
  }

  return new ethers.Contract(CONTRACT_ADDRESS, SKILLCHAIN_ABI, provider)
}

// ── Issue credential on-chain ─────────────────────────────────
export const issueCredentialOnChain = async ({ recipient, metadataHash, skillName, level }) => {
  try {
    const contract = await getContract(true)
    const tx = await contract.issueCredential(recipient, metadataHash, skillName, level)
    const receipt = await tx.wait()

    // Extract credential ID from event
    const event = receipt.logs
      .map(log => { try { return contract.interface.parseLog(log) } catch { return null } })
      .find(e => e?.name === 'CredentialIssued')

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      credentialId: event?.args?.credentialId,
      gasUsed: receipt.gasUsed.toString(),
    }
  } catch (err) {
    throw new Error(err.reason || err.message || 'On-chain issuance failed')
  }
}

// ── Verify credential on-chain ────────────────────────────────
export const verifyCredentialOnChain = async (credentialId) => {
  try {
    const contract = await getContract(false)
    const result = await contract.verifyCredential(credentialId)

    return {
      isValid: result.isValid,
      recipient: result.recipient,
      issuer: result.issuer,
      metadataHash: result.metadataHash,
      issuedAt: new Date(Number(result.issuedAt) * 1000).toISOString(),
      revoked: result.revoked,
    }
  } catch (err) {
    throw new Error(err.reason || err.message || 'On-chain verification failed')
  }
}

// ── Revoke credential on-chain ────────────────────────────────
export const revokeCredentialOnChain = async (credentialId) => {
  try {
    const contract = await getContract(true)
    const tx = await contract.revokeCredential(credentialId)
    const receipt = await tx.wait()
    return { txHash: receipt.hash, blockNumber: receipt.blockNumber }
  } catch (err) {
    throw new Error(err.reason || err.message || 'On-chain revocation failed')
  }
}

// ── Get credentials by wallet ─────────────────────────────────
export const getWalletCredentials = async (address) => {
  try {
    const contract = await getContract(false)
    const credentialIds = await contract.getCredentialsByRecipient(address)
    return credentialIds
  } catch (err) {
    console.error('Error fetching wallet credentials:', err)
    return []
  }
}

// ── Get total credential count ────────────────────────────────
export const getTotalCredentials = async () => {
  try {
    const contract = await getContract(false)
    const total = await contract.totalCredentials()
    return Number(total)
  } catch (err) {
    return 0
  }
}
