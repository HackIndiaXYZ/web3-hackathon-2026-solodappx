import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowUpRight, FiActivity, FiExternalLink, FiRefreshCw, FiShield, FiLoader } from 'react-icons/fi'
import api from '../utils/api'
import { formatDateTime, shortAddress, polygonscanUrl } from '../utils/helpers'

const TYPE_CONFIG = {
  credential_issue:  { label: 'Issue',  color: '#00f5ff', bg: 'rgba(0,245,255,0.1)' },
  credential_revoke: { label: 'Revoke', color: '#ff006e', bg: 'rgba(255,0,110,0.1)' },
  wallet_connect:    { label: 'Connect',color: '#39ff14', bg: 'rgba(57,255,20,0.1)' },
  transfer:          { label: 'Transfer',color:'#bf00ff', bg: 'rgba(191,0,255,0.1)' },
}

function TxRow({ tx, index }) {
  const cfg = TYPE_CONFIG[tx.type] || { label: tx.type, color: '#00f5ff', bg: 'rgba(0,245,255,0.1)' }
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card p-4 hover:border-neon-cyan/20 transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
          <FiArrowUpRight size={16} style={{ color: cfg.color }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-semibold">{tx.description || cfg.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-gray-600 text-xs font-mono">{shortAddress(tx.tx_hash, 10)}</span>
            {tx.block_number && (
              <span className="text-gray-700 text-xs font-mono">Block #{tx.block_number.toLocaleString()}</span>
            )}
            <span className="text-gray-700 text-xs font-mono">{formatDateTime(tx.created_at)}</span>
          </div>
          {tx.skill_name && (
            <p className="text-gray-600 text-xs font-mono mt-0.5 flex items-center gap-1">
              <FiShield size={10} />
              {tx.skill_name} · {tx.category}
            </p>
          )}
        </div>

        {/* Status + Link */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
            tx.status === 'confirmed'
              ? 'text-neon-green bg-neon-green/10 border-neon-green/30'
              : tx.status === 'pending'
              ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
              : 'text-neon-pink bg-neon-pink/10 border-neon-pink/30'
          }`}>
            {tx.status}
          </span>
          <a
            href={polygonscanUrl(tx.tx_hash)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-gray-700 hover:text-neon-cyan transition-colors"
          >
            <FiExternalLink size={13} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTx = async (p = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const { data } = await api.get(`/transactions?page=${p}&limit=20`)
      if (p === 1) {
        setTransactions(data.transactions)
      } else {
        setTransactions(prev => [...prev, ...data.transactions])
      }
      setTotal(data.total)
      setPage(p)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchTx(1) }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">
            Transaction <span className="gradient-text">History</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-0.5">{total} on-chain operations recorded</p>
        </div>
        <button
          onClick={() => fetchTx(1, true)}
          disabled={refreshing}
          className="cyber-btn text-xs py-2 px-4 flex items-center gap-2"
        >
          <FiRefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader size={28} className="text-neon-cyan animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiActivity size={36} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm">No transactions yet</p>
          <p className="text-gray-700 font-mono text-xs mt-1">Transactions appear when you issue credentials</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <TxRow key={tx.id} tx={tx} index={i} />
          ))}
          {transactions.length < total && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchTx(page + 1)}
                className="cyber-btn text-xs py-2 px-6"
              >
                Load More ({total - transactions.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
