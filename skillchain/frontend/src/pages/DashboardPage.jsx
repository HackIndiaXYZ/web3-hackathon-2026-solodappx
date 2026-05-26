import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield, FiCheckCircle, FiClock, FiXCircle,
  FiTrendingUp, FiPlus, FiZap, FiCpu, FiActivity, FiRefreshCw
} from 'react-icons/fi'
import { fetchCredentials } from '../store/slices/credentialSlice'
import { openModal } from '../store/slices/uiSlice'
import CredentialCard from '../components/credentials/CredentialCard'
import IssueCredentialModal from '../components/credentials/IssueCredentialModal'
import { SkeletonStats, SkeletonList } from '../components/common/Skeleton'
import { shortAddress, timeAgo } from '../utils/helpers'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { list, loading } = useSelector(s => s.credentials)
  const { address, isConnected, balance } = useSelector(s => s.web3)
  const { activeModal } = useSelector(s => s.ui)

  const [dashStats, setDashStats] = useState({ total: 0, verified: 0, pending: 0, revoked: 0, transactions: 0 })
  const [chartData, setChartData] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const { data } = await api.get('/stats/dashboard')
      setDashStats(data.stats)
      // Fill in missing months with 0 if needed
      setChartData(data.monthly.length ? data.monthly : [{ month: 'Now', credentials: 0 }])
    } catch {
      // fallback: use credential slice stats
    }
    setStatsLoading(false)
  }

  useEffect(() => {
    dispatch(fetchCredentials())
    fetchStats()
  }, [dispatch])

  const STAT_CARDS = [
    { icon: FiShield,      label: 'Total Credentials',  value: dashStats.total,        color: '#00f5ff', sub: 'All time' },
    { icon: FiCheckCircle, label: 'Verified On-Chain',  value: dashStats.verified,     color: '#39ff14', sub: 'Active' },
    { icon: FiClock,       label: 'Pending',            value: dashStats.pending,      color: '#fff200', sub: 'Processing' },
    { icon: FiActivity,    label: 'Transactions',       value: dashStats.transactions, color: '#bf00ff', sub: 'On-chain ops' },
  ]

  const firstName = user?.name?.split(' ')[0] || 'Agent'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">
            Welcome back, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 font-mono">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => { dispatch(fetchCredentials()); fetchStats() }}
            className="cyber-btn text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <FiRefreshCw size={13} />
            Refresh
          </button>
          <button
            onClick={() => dispatch(openModal({ modal: 'issueCredential' }))}
            className="cyber-btn cyber-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            <FiPlus size={14} />
            Issue Credential
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <SkeletonStats count={4} />
      ) : (
        <motion.div
          variants={stagger.container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STAT_CARDS.map(stat => (
            <motion.div key={stat.label} variants={stagger.item}
              className="glass-card p-5 group hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <FiTrendingUp size={14} className="text-gray-700" />
              </div>
              <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-700 font-mono mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent credentials */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm text-gray-400 tracking-wider">RECENT CREDENTIALS</h2>
            <Link to="/credentials" className="text-xs text-neon-cyan hover:underline font-mono">View All →</Link>
          </div>
          {loading ? <SkeletonList count={3} /> : list.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FiShield size={36} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-mono text-sm">No credentials yet</p>
              <button
                onClick={() => dispatch(openModal({ modal: 'issueCredential' }))}
                className="mt-4 text-neon-cyan text-sm hover:underline font-mono"
              >
                Issue your first credential →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {list.slice(0, 4).map(cred => (
                <CredentialCard key={cred.id || cred._id} credential={cred} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Wallet status */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiZap size={15} className="text-neon-cyan" />
              <h3 className="font-display text-sm text-gray-400 tracking-wider">WALLET STATUS</h3>
            </div>
            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <span className="text-xs text-neon-green font-mono">Connected</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-mono">ADDRESS</p>
                  <p className="text-neon-cyan font-mono text-sm">{shortAddress(address, 8)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-mono">BALANCE</p>
                  <p className="text-white font-display text-xl">
                    {parseFloat(balance || 0).toFixed(4)}
                    <span className="text-gray-500 text-sm ml-1">MATIC</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="w-2 h-2 rounded-full bg-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs font-mono mb-3">Wallet not connected</p>
                <Link to="/wallet" className="cyber-btn text-xs py-2 px-4">Connect Wallet</Link>
              </div>
            )}
          </div>

          {/* Activity chart — real data */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp size={15} className="text-neon-purple" />
              <h3 className="font-display text-sm text-gray-400 tracking-wider">ACTIVITY (6 MO)</h3>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="credGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(224,232,240,0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(5,13,21,0.95)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, fontSize: 11, color: '#00f5ff', fontFamily: '"Share Tech Mono"' }} />
                  <Area type="monotone" dataKey="credentials" stroke="#00f5ff" strokeWidth={1.5} fill="url(#credGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-24 flex items-center justify-center">
                <p className="text-gray-700 text-xs font-mono">No activity data yet</p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="glass-card p-5">
            <h3 className="font-display text-sm text-gray-400 tracking-wider mb-4">QUICK ACCESS</h3>
            <div className="space-y-2">
              {[
                { icon: FiShield,   label: 'Credentials',   to: '/credentials', color: '#00f5ff' },
                { icon: FiActivity, label: 'Transactions',  to: '/transactions',color: '#bf00ff' },
                { icon: FiCpu,      label: 'AI Assistant',  to: '/ai-assistant',color: '#ff006e' },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <item.icon size={13} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                  <span className="ml-auto text-gray-700 group-hover:text-gray-400 transition-colors text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === 'issueCredential' && <IssueCredentialModal />}
      </AnimatePresence>
    </motion.div>
  )
}
