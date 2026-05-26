import { motion } from 'framer-motion'
import { FiShield, FiExternalLink, FiCopy, FiCheckCircle, FiXCircle, FiClock, FiLink } from 'react-icons/fi'
import { formatDate, shortAddress, getCategoryColor, polygonscanUrl, copyToClipboard } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  verified: { icon: FiCheckCircle, label: 'Verified', className: 'status-verified' },
  pending:  { icon: FiClock,       label: 'Pending',  className: 'status-pending'  },
  revoked:  { icon: FiXCircle,     label: 'Revoked',  className: 'status-revoked'  },
}

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

export default function CredentialCard({ credential, onClick, compact = false }) {
  const status = STATUS_CONFIG[credential.status] || STATUS_CONFIG.pending
  const StatusIcon = status.icon
  const categoryColor = getCategoryColor(credential.category)

  // Handle both snake_case (DB) and camelCase (legacy)
  const skillName    = credential.skill_name    || credential.skillName    || 'Unknown Skill'
  const issuerName   = credential.issuer_name   || credential.issuerName   || ''
  const issuerAddr   = credential.issuer_address|| credential.issuerAddress|| ''
  const txHash       = credential.tx_hash       || credential.txHash       || ''
  const issuedAt     = credential.issued_at     || credential.issuedAt     || credential.createdAt
  const credentialId = credential.credential_id || credential.credentialId || credential.id || ''

  const verifyUrl = `${window.location.origin}/verify/${credentialId}`

  const handleCopyId = async (e) => {
    e.stopPropagation()
    await copyToClipboard(credentialId)
    toast.success('Credential ID copied!')
  }

  const handleCopyLink = async (e) => {
    e.stopPropagation()
    await copyToClipboard(verifyUrl)
    toast.success('Share link copied!')
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => onClick?.(credential)}
      className={`credential-card cursor-pointer transition-all duration-300 ${compact ? 'p-4' : 'p-5'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${categoryColor}20`, border: `1px solid ${categoryColor}40` }}>
            <FiShield size={18} style={{ color: categoryColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm leading-tight truncate">{skillName}</h3>
            <p className="text-gray-500 text-xs mt-0.5 font-mono">
              {credential.category} · Level {credential.level} — {LEVEL_LABELS[credential.level]}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono flex-shrink-0 ml-2 ${status.className}`}>
          <StatusIcon size={10} />
          {status.label}
        </span>
      </div>

      {!compact && (
        <>
          <div className="flex items-center justify-between text-xs mb-3">
            <div>
              <span className="text-gray-600 mr-1">Issued by:</span>
              <span className="text-gray-400 font-mono">{issuerName || shortAddress(issuerAddr)}</span>
            </div>
            <span className="text-gray-600 font-mono">{formatDate(issuedAt)}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              {txHash ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-[11px] text-gray-600 font-mono">
                    {shortAddress(txHash, 8)}
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-gray-700 font-mono">{credentialId.slice(0, 20)}...</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Share link button */}
              <button onClick={handleCopyLink} className="text-gray-600 hover:text-neon-purple transition-colors p-1.5 rounded-md hover:bg-neon-purple/10" title="Copy share link">
                <FiLink size={12} />
              </button>
              <button onClick={handleCopyId} className="text-gray-600 hover:text-neon-cyan transition-colors p-1.5 rounded-md hover:bg-neon-cyan/10" title="Copy credential ID">
                <FiCopy size={12} />
              </button>
              {txHash && (
                <a href={polygonscanUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-gray-600 hover:text-neon-cyan transition-colors p-1.5 rounded-md hover:bg-neon-cyan/10"
                  title="View on Polygonscan">
                  <FiExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}