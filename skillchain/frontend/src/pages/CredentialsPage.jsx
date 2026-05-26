import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus, FiSearch, FiFilter, FiShield, FiCheckCircle,
  FiClock, FiXCircle, FiRefreshCw, FiGrid, FiList
} from 'react-icons/fi'
import { fetchCredentials, verifyCredential, selectCredential } from '../store/slices/credentialSlice'
import { openModal } from '../store/slices/uiSlice'
import CredentialCard from '../components/credentials/CredentialCard'
import IssueCredentialModal from '../components/credentials/IssueCredentialModal'
import CredentialDetailModal from '../components/credentials/CredentialDetailModal'
import { SkeletonList } from '../components/common/Skeleton'
import toast from 'react-hot-toast'

const FILTERS = [
  { label: 'All', value: 'all', icon: FiShield },
  { label: 'Verified', value: 'verified', icon: FiCheckCircle },
  { label: 'Pending', value: 'pending', icon: FiClock },
  { label: 'Revoked', value: 'revoked', icon: FiXCircle },
]

export default function CredentialsPage() {
  const dispatch = useDispatch()
  const { list, loading, issuing, selected } = useSelector(s => s.credentials)
  const { activeModal } = useSelector(s => s.ui)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  useEffect(() => { dispatch(fetchCredentials()) }, [dispatch])

  const filtered = list.filter(c => {
    const matchSearch = !search ||
      c.skillName?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.issuerName?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const handleSelectCredential = (cred) => {
    dispatch(selectCredential(cred))
    dispatch(openModal({ modal: 'credentialDetail' }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">
            My <span className="gradient-text">Credentials</span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 font-mono">
            {list.length} credential{list.length !== 1 ? 's' : ''} on Polygon blockchain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchCredentials())}
            disabled={loading}
            className="p-2.5 glass-card border border-white/10 rounded-xl text-gray-500 hover:text-neon-cyan transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => dispatch(openModal({ modal: 'issueCredential' }))}
            className="cyber-btn cyber-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            <FiPlus size={14} />
            Issue New
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by skill, category, issuer..."
            className="cyber-input pl-10 text-sm"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all
                ${filter === f.value
                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                  : 'glass-card border border-white/5 text-gray-500 hover:text-gray-300'
                }`}
            >
              <f.icon size={11} />
              {f.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 glass-card border border-white/5 rounded-xl p-1">
          {[{ icon: FiGrid, mode: 'grid' }, { icon: FiList, mode: 'list' }].map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={`p-2 rounded-lg transition-colors ${viewMode === v.mode ? 'bg-neon-cyan/10 text-neon-cyan' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <v.icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Credentials grid/list */}
      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 text-center"
        >
          <FiShield size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm">
            {search || filter !== 'all' ? 'No credentials match your filters' : 'No credentials yet'}
          </p>
          {(!search && filter === 'all') && (
            <button
              onClick={() => dispatch(openModal({ modal: 'issueCredential' }))}
              className="mt-4 text-neon-cyan text-sm hover:underline font-mono"
            >
              Issue your first credential →
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className={viewMode === 'grid'
            ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }
        >
          <AnimatePresence>
            {filtered.map((cred, i) => (
              <motion.div
                key={cred._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <CredentialCard
                  credential={cred}
                  onClick={handleSelectCredential}
                  compact={viewMode === 'list'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'issueCredential' && <IssueCredentialModal />}
        {activeModal === 'credentialDetail' && selected && <CredentialDetailModal />}
      </AnimatePresence>
    </motion.div>
  )
}
