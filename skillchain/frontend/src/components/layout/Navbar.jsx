import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu, FiBell, FiLogOut, FiUser, FiActivity,
  FiChevronDown, FiWifi, FiWifiOff, FiCheck, FiTrash2
} from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import { disconnectWallet } from '../../store/slices/web3Slice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { shortAddress, timeAgo } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  credential_issued: '#00f5ff',
  credential_revoke: '#ff006e',
  info:              '#bf00ff',
  warning:           '#fff200',
  success:           '#39ff14',
}

export default function Navbar() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { user }   = useSelector(s => s.auth)
  const { address, isConnected, balance } = useSelector(s => s.web3)

  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const [bellOpen,     setBellOpen]       = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread,        setUnread]        = useState(0)
  const bellRef    = useRef(null)
  const dropRef    = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=15')
      setNotifications(data.notifications || [])
      setUnread(data.unreadCount || 0)
    } catch { /* silent fail */ }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) // poll every 30s
      return () => clearInterval(interval)
    }
  }, [user])

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read', {})
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
    } catch {}
  }

  const clearRead = async () => {
    try {
      await api.delete('/notifications/clear')
      setNotifications(prev => prev.filter(n => !n.is_read))
    } catch {}
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(disconnectWallet())
    toast.success('Disconnected from SkillChain')
    navigate('/')
  }

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 glass border-b border-white/5 h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">

        {/* Hamburger */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-cyan transition-colors"
        >
          <FiMenu size={20} />
        </button>

        {/* Wallet status */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono
            ${isConnected
              ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
              : 'bg-white/5 border border-white/10 text-gray-500'}`}>
            {isConnected ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {isConnected ? `Polygon Amoy · ${shortAddress(address)}` : 'Wallet Not Connected'}
          </div>
          {isConnected && (
            <span className="text-xs font-mono text-gray-500">
              {parseFloat(balance || 0).toFixed(4)} MATIC
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1">

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setBellOpen(v => !v); setDropdownOpen(false) }}
              className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-cyan transition-colors"
            >
              <FiBell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-neon-pink rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {bellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card border border-white/10 rounded-xl overflow-hidden z-50"
                >
                  {/* Bell header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="font-display text-xs text-gray-400 tracking-wider">NOTIFICATIONS</span>
                    <div className="flex gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-neon-cyan hover:underline font-mono flex items-center gap-1">
                          <FiCheck size={10} /> Mark all read
                        </button>
                      )}
                      <button onClick={clearRead} className="text-[10px] text-gray-600 hover:text-gray-400 font-mono flex items-center gap-1">
                        <FiTrash2 size={10} /> Clear
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <FiBell size={24} className="text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-600 text-xs font-mono">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const dotColor = TYPE_COLORS[n.type] || '#00f5ff'
                        return (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors ${!n.is_read ? 'bg-neon-cyan/3' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.is_read ? '#333' : dotColor }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-semibold leading-tight truncate">{n.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-gray-700 text-[10px] font-mono mt-1">{timeAgo(n.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => { setDropdownOpen(v => !v); setBellOpen(false) }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-neon-cyan/30" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-xs font-bold text-dark-900">
                  {avatarLetter}
                </div>
              )}
              <span className="hidden sm:block text-sm text-gray-300 font-body max-w-[100px] truncate">
                {user?.name || 'User'}
              </span>
              <FiChevronDown size={14} className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 rounded-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <nav className="p-1">
                    {[
                      { icon: FiUser,     label: 'Profile',      to: '/profile' },
                      { icon: FiActivity, label: 'Transactions',  to: '/transactions' },
                    ].map(item => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-neon-cyan transition-colors"
                      >
                        <item.icon size={15} />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neon-pink hover:bg-neon-pink/10 transition-colors"
                    >
                      <FiLogOut size={15} />
                      Disconnect
                    </button>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
