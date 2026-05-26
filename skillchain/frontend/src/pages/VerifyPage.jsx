import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield, FiSearch, FiCheckCircle, FiXCircle,
  FiArrowLeft, FiExternalLink, FiLoader, FiClock
} from 'react-icons/fi'
import api from '../utils/api'
import { formatDateTime, shortAddress, polygonscanUrl, getCategoryColor } from '../utils/helpers'

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

export default function VerifyPage() {
  const { id } = useParams()
  const [credentialId, setCredentialId] = useState(id !== 'demo' ? (id || '') : '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVerify = async (idToVerify) => {
    const target = idToVerify || credentialId
    if (!target || target === 'demo') return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await api.get(`/credentials/verify/${target}`)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Credential not found or invalid ID')
    }
    setLoading(false)
  }

  // If a real ID in URL, auto-verify
  useEffect(() => {
    if (id && id !== 'demo') handleVerify(id)
  }, [id])

  const catColor = result?.credential ? getCategoryColor(result.credential.category) : '#00f5ff'

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-8 pb-16 relative">
      {/* Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      {/* Back */}
      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-500 hover:text-neon-cyan transition-colors">
        <FiArrowLeft size={16} />
        <span className="font-mono">Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-neon-cyan" />
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-2">VERIFY CREDENTIAL</h1>
          <p className="text-gray-500 text-sm font-mono">
            Trustless on-chain verification · Polygon Blockchain
          </p>
        </motion.div>

        {/* Search box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 border-neon-cyan/10 mb-6"
        >
          <label className="block text-[10px] text-gray-600 font-mono mb-2 tracking-widest">
            ENTER CREDENTIAL ID
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                value={credentialId}
                onChange={e => setCredentialId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="e.g. 60a7b2c3d4e5f6789abc1234..."
                className="cyber-input pl-10 font-mono text-sm"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !credentialId}
              className="cyber-btn cyber-btn-primary text-xs py-2 px-6 flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? <FiLoader size={14} className="animate-spin" /> : <FiCheckCircle size={14} />}
              Verify
            </button>
          </div>
          <p className="text-[10px] text-gray-700 font-mono mt-2">
            The credential ID is the unique on-chain identifier issued with every SkillChain credential.
          </p>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-10 text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
                <FiShield className="absolute inset-0 m-auto text-neon-cyan" size={22} />
              </div>
              <p className="text-neon-cyan font-display text-sm tracking-wider">QUERYING BLOCKCHAIN...</p>
              <p className="text-gray-600 text-xs font-mono mt-2">Connecting to Polygon Amoy</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 text-center border-neon-pink/20"
            >
              <div className="w-14 h-14 rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center mx-auto mb-4">
                <FiXCircle size={26} className="text-neon-pink" />
              </div>
              <h3 className="font-display text-lg text-neon-pink mb-2">VERIFICATION FAILED</h3>
              <p className="text-gray-500 text-sm">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Status banner */}
              <div className={`p-4 rounded-xl flex items-center gap-3
                ${result.isValid
                  ? 'bg-neon-green/10 border border-neon-green/30'
                  : 'bg-neon-pink/10 border border-neon-pink/30'
                }`}>
                {result.isValid
                  ? <FiCheckCircle size={22} className="text-neon-green" />
                  : <FiXCircle size={22} className="text-neon-pink" />
                }
                <div>
                  <p className={`font-display text-base font-bold ${result.isValid ? 'text-neon-green' : 'text-neon-pink'}`}>
                    {result.isValid ? '✓ CREDENTIAL VERIFIED' : '✗ CREDENTIAL INVALID'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {result.isValid ? 'This credential is authentic and active on Polygon blockchain' : 'This credential could not be verified'}
                  </p>
                </div>
              </div>

              {/* Credential details */}
              {result.credential && (
                <div className="glass-card p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${catColor}15`, border: `1px solid ${catColor}30` }}>
                      <FiShield size={22} style={{ color: catColor }} />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-lg">{result.credential.skillName}</h2>
                      <p className="text-gray-500 text-sm font-mono">
                        {result.credential.category} · Level {result.credential.level} — {LEVEL_LABELS[result.credential.level]}
                      </p>
                    </div>
                    <span className={`ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono
                      ${result.credential.status === 'verified' ? 'status-verified' : 'status-pending'}`}>
                      {result.credential.status === 'verified' ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                      {result.credential.status}
                    </span>
                  </div>

                  {result.credential.description && (
                    <p className="text-gray-400 text-sm mb-5 p-3 bg-dark-700/40 rounded-xl">
                      {result.credential.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'ISSUED BY', value: result.credential.issuerName || shortAddress(result.credential.issuerAddress || '') },
                      { label: 'RECIPIENT', value: result.credential.recipientName || shortAddress(result.credential.recipientAddress || '') },
                      { label: 'ISSUE DATE', value: formatDateTime(result.credential.issuedAt) },
                      { label: 'EXPIRES', value: result.credential.expiresAt ? formatDateTime(result.credential.expiresAt) : 'Never' },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-dark-700/30 rounded-xl border border-white/5">
                        <p className="text-[10px] text-gray-600 font-mono mb-1">{item.label}</p>
                        <p className="text-sm text-gray-300">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {result.credential.txHash && (
                    <div className="mt-4 p-3 bg-neon-green/5 border border-neon-green/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-neon-green font-mono font-semibold mb-1">BLOCKCHAIN RECORD</p>
                        <p className="text-xs text-gray-600 font-mono">{shortAddress(result.credential.txHash, 12)}</p>
                      </div>
                      <a
                        href={polygonscanUrl(result.credential.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-neon-cyan hover:underline font-mono"
                      >
                        Polygonscan <FiExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Issued by org info */}
              <div className="glass-card p-4 flex items-center gap-3 border-neon-cyan/10">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                  <FiShield size={14} className="text-neon-cyan" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verified by <span className="text-neon-cyan font-mono">SkillChain Protocol</span></p>
                  <p className="text-[10px] text-gray-600 font-mono">Polygon Amoy Testnet · Block-level security</p>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !error && !result && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-700"
            >
              <FiShield size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-mono text-sm">Enter a credential ID above to verify</p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-gray-700 text-xs font-mono mt-8">
          SkillChain · Trustless Credential Verification · Powered by Polygon
        </p>
      </div>
    </div>
  )
}
