// ── Address formatting ────────────────────────────────────────
export const shortAddress = (address, chars = 6) => {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

// ── Format MATIC balance ──────────────────────────────────────
export const formatBalance = (balance, decimals = 4) => {
  const num = parseFloat(balance)
  if (isNaN(num)) return '0.0000'
  return num.toFixed(decimals)
}

// ── Date formatting ───────────────────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const timeAgo = (dateString) => {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(dateString)
}

// ── Generate random hex color ─────────────────────────────────
export const randomNeonColor = () => {
  const colors = ['#00f5ff', '#bf00ff', '#ff006e', '#39ff14', '#fff200']
  return colors[Math.floor(Math.random() * colors.length)]
}

// ── Copy to clipboard ─────────────────────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}

// ── Skill category colors ─────────────────────────────────────
export const getCategoryColor = (category) => {
  const map = {
    'blockchain': '#00f5ff',
    'development': '#bf00ff',
    'design': '#ff006e',
    'data-science': '#39ff14',
    'cybersecurity': '#fff200',
    'ai-ml': '#ff8c00',
    'cloud': '#00bfff',
    'devops': '#7fff00',
    'other': '#808080',
  }
  return map[category?.toLowerCase()] || '#00f5ff'
}

// ── Generate credential hash (mock) ──────────────────────────
export const generateMockTxHash = () => {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)]
  return hash
}

// ── Polygon scan URL ──────────────────────────────────────────
export const polygonscanUrl = (txHash) =>
  `https://amoy.polygonscan.com/tx/${txHash}`

export const polygonscanAddressUrl = (address) =>
  `https://amoy.polygonscan.com/address/${address}`

// ── Validate Ethereum address ─────────────────────────────────
export const isValidAddress = (address) => {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

// ── Truncate text ─────────────────────────────────────────────
export const truncate = (str, maxLength = 100) => {
  if (!str) return ''
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str
}
