import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX, FiShield, FiCheckCircle, FiClock, FiXCircle,
  FiExternalLink, FiCopy, FiAlertTriangle, FiLoader, FiLink
} from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'
import { verifyCredential, revokeCredential } from '../../store/slices/credentialSlice'
import { closeModal } from '../../store/slices/uiSlice'
import {
  shortAddress, formatDateTime, polygonscanUrl,
  copyToClipboard, getCategoryColor
} from '../../utils/helpers'
import toast from 'react-hot-toast'

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

export default function CredentialDetailModal() {
  const dispatch = useDispatch()
  const { selected, verifying, verificationResult } = useSelector(s => s.credentials)
  const { user } = useSelector(s => s.auth)
  const [revoking, setRevoking] = useState(false)

  if (!selected) return null

  const catColor = getCategoryColor(selected.category)
  const isOwner = user?.walletAddress === selected.issuerAddress

  const handleVerify = async () => {
    const result = await dispatch(verifyCredential(selected._id))
    if (verifyCredential.fulfilled.match(result)) {
      toast.success('Credential verified on-chain!')
    } else {
      toast.error('Verification failed')
    }
  }

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to revoke this credential? This cannot be undone.')) return
    setRevoking(true)
    const result = await dispatch(revokeCredential(selected._id))
    setRevoking(false)
    if (revokeCredential.fulfilled.match(result)) {
      toast.success('Credential revoked')
      dispatch(closeModal())
    } else {
      toast.error('Revocation failed')
    }
  }

  const statusConfig = {
    verified: { icon: FiCheckCircle, label: 'Verified', className: 'status-verified' },
    pending: { icon: FiClock, label: 'Pending', className: 'status-pending' },
    revoked: { icon: FiXCircle, label: 'Revoked', className: 'status-revoked' },
  }[selected.status] || { icon: FiClock, label: 'Pending', className: 'status-pending' }
  const StatusIcon = statusConfig.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => dispatch(closeModal())}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative glass-card w-full max-w-lg border border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Animated top border */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${catColor}, #bf00ff, ${catColor})`, backgroundSize: '200%', animation: 'borderFlow 3s linear infinite' }} />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${catColor}15`, border: `1px solid ${catColor}30` }}>
              <FiShield size={22} style={{ color: catColor }} />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">{selected.skillName}</h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {selected.category} · Level {selected.level} — {LEVEL_LABELS[selected.level]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono ${statusConfig.className}`}>
              <StatusIcon size={10} /> {statusConfig.label}
            </span>
            <button onClick={() => dispatch(closeModal())} className="text-gray-500 hover:text-white transition-colors ml-1">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Description */}
          {selected.description && (
            <div className="p-3 bg-dark-700/50 rounded-xl border border-white/5">
              <p className="text-sm text-gray-400 leading-relaxed">{selected.description}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ISSUER', value: selected.issuerName || shortAddress(selected.issuerAddress || ''), mono: true },
              { label: 'RECIPIENT', value: selected.recipientName || shortAddress(selected.recipientAddress || ''), mono: true },
              { label: 'ISSUED AT', value: formatDateTime(selected.issuedAt || selected.createdAt) },
              { label: 'EXPIRES', value: selected.expiresAt ? formatDateTime(selected.expiresAt) : 'Never' },
            ].map(info => (
              <div key={info.label} className="p-3 bg-dark-700/30 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-600 font-mono mb-1">{info.label}</p>
                <p className={`text-sm text-gray-300 truncate ${info.mono ? 'font-mono' : ''}`}>{info.value}</p>
              </div>
            ))}
          </div>

          {/* Blockchain info */}
          {selected.txHash && (
            <div className="p-4 bg-neon-green/5 border border-neon-green/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <p className="text-xs text-neon-green font-mono font-semibold">ON-CHAIN RECORD</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-mono truncate flex-1">{selected.txHash}</p>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => { copyToClipboard(selected.txHash); toast.success('Copied!') }}
                    className="text-gray-600 hover:text-neon-cyan transition-colors p-1">
                    <FiCopy size={12} />
                  </button>
                  <a href={polygonscanUrl(selected.txHash)} target="_blank" rel="noopener noreferrer"
                    className="text-gray-600 hover:text-neon-cyan transition-colors p-1">
                    <FiExternalLink size={12} />
                  </a>
                </div>
              </div>
              {selected.blockNumber && (
                <p className="text-[10px] text-gray-700 font-mono mt-1">Block #{selected.blockNumber}</p>
              )}
            </div>
          )}

          {/* Verification result */}
          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-xl border ${verificationResult.isValid
                  ? 'bg-neon-green/5 border-neon-green/20'
                  : 'bg-neon-pink/5 border-neon-pink/20'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {verificationResult.isValid
                    ? <FiCheckCircle size={14} className="text-neon-green" />
                    : <FiXCircle size={14} className="text-neon-pink" />}
                  <p className={`text-sm font-semibold font-mono ${verificationResult.isValid ? 'text-neon-green' : 'text-neon-pink'}`}>
                    {verificationResult.isValid ? 'BLOCKCHAIN VERIFIED ✓' : 'VERIFICATION FAILED ✗'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">{verificationResult.message || 'Credential status confirmed on Polygon'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 cyber-btn cyber-btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
          >
            {verifying ? <FiLoader size={13} className="animate-spin" /> : <FiCheckCircle size={13} />}
            {verifying ? 'Verifying...' : 'Verify On-Chain'}
          </button>
          {isOwner && selected.status !== 'revoked' && (
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="cyber-btn text-xs py-2.5 px-4 border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10 flex items-center gap-2"
            >
              {revoking ? <FiLoader size={13} className="animate-spin" /> : <FiAlertTriangle size={13} />}
              Revoke
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
