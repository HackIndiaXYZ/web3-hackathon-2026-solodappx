import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiShield, FiArrowLeft, FiExternalLink, FiCheckCircle,
  FiXCircle, FiClock, FiSearch, FiUser, FiGlobe, FiGithub, FiTwitter
} from 'react-icons/fi'
import api from '../utils/api'
import { formatDate, getCategoryColor, polygonscanAddressUrl, shortAddress } from '../utils/helpers'

const STATUS_CFG = {
  verified: { icon: FiCheckCircle, label: 'Verified', cls: 'text-neon-green bg-neon-green/10 border-neon-green/30' },
  pending:  { icon: FiClock,       label: 'Pending',  cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  revoked:  { icon: FiXCircle,     label: 'Revoked',  cls: 'text-neon-pink  bg-neon-pink/10  border-neon-pink/30'  },
}

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master']

export default function PublicProfilePage() {
  const { address } = useParams()
  const [inputAddr, setInputAddr] = useState(address || '')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = async (addr) => {
    const target = addr || inputAddr
    if (!target) return
    if (!/^0x[0-9a-fA-F]{40}$/.test(target)) {
      setError('Invalid Ethereum address format')
      return
    }
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const { data: res } = await api.get(`/credentials/public/${target}`)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (address) fetchProfile(address)
  }, [address])

  const credentials = data?.credentials || []
  const verifiedCount = credentials.filter(c => c.status === 'verified').length

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-8 pb-16 relative">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(191,0,255,0.08) 0%, transparent 60%)' }} />

      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-500 hover:text-neon-cyan transition-colors">
        <FiArrowLeft size={16} />
        <span className="font-mono">Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30 flex items-center justify-center mx-auto mb-4">
            <FiUser size={28} className="text-neon-purple" />
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-2">PUBLIC PROFILE</h1>
          <p className="text-gray-500 text-sm font-mono">View credentials by wallet address</p>
        </motion.div>

        {/* Address input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 border-neon-purple/10 mb-6">
          <label className="block text-[10px] text-gray-600 font-mono mb-2 tracking-widest">WALLET ADDRESS</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputAddr}
              onChange={e => setInputAddr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchProfile()}
              placeholder="0x... (42 character Ethereum address)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-700 focus:outline-none focus:border-neon-purple/50 transition-colors"
            />
            <button
              onClick={() => fetchProfile()}
              disabled={loading}
              className="cyber-btn cyber-btn-primary px-5 py-3 flex items-center gap-2 text-sm"
              style={{ '--btn-color': '#bf00ff' }}
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch size={16} />}
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 border-neon-pink/30 mb-6 flex items-center gap-3">
            <FiXCircle className="text-neon-pink flex-shrink-0" size={18} />
            <p className="text-neon-pink text-sm font-mono">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Profile header */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 flex items-center justify-center flex-shrink-0 text-2xl font-display font-bold text-neon-purple">
                  {data.address?.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-display text-lg">{shortAddress(data.address, 10)}</p>
                  <p className="text-gray-500 text-xs font-mono break-all">{data.address}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-mono">
                      {credentials.length} credentials
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green font-mono">
                      {verifiedCount} verified
                    </span>
                  </div>
                </div>
                <a
                  href={polygonscanAddressUrl(data.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-neon-cyan transition-colors font-mono"
                >
                  <FiExternalLink size={13} />
                  PolygonScan
                </a>
              </div>
            </div>

            {/* Credentials list */}
            {credentials.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FiShield size={36} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-mono text-sm">No public credentials for this address</p>
              </div>
            ) : (
              <div className="space-y-3">
                {credentials.map((cred, i) => {
                  const catColor = getCategoryColor(cred.category)
                  const statusCfg = STATUS_CFG[cred.status] || STATUS_CFG.pending
                  const StatusIcon = statusCfg.icon
                  return (
                    <motion.div
                      key={cred.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-5 hover:border-neon-purple/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${catColor}20`, border: `1px solid ${catColor}40` }}>
                            <FiShield size={18} style={{ color: catColor }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{cred.skill_name}</p>
                            <p className="text-gray-500 text-xs font-mono">{cred.category} · Level {cred.level} — {LEVEL_LABELS[cred.level]}</p>
                            <p className="text-gray-600 text-xs font-mono mt-0.5">by {cred.issuer_name || shortAddress(cred.issuer_address)}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono border ${statusCfg.cls}`}>
                            <StatusIcon size={10} />
                            {statusCfg.label}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">{formatDate(cred.issued_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
