import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  FiGrid, FiCreditCard, FiCpu, FiUser,
  FiInfo, FiZap, FiShield, FiX, FiActivity, FiUsers
} from 'react-icons/fi'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const NAV_ITEMS = [
  { icon: FiGrid,       label: 'Dashboard',    to: '/dashboard' },
  { icon: FiCreditCard, label: 'Credentials',  to: '/credentials' },
  { icon: FiActivity,   label: 'Transactions', to: '/transactions' },
  { icon: FiZap,        label: 'Wallet',       to: '/wallet' },
  { icon: FiCpu,        label: 'AI Assistant', to: '/ai-assistant' },
  { icon: FiUsers,      label: 'Public Profile',to: '/public' },
  { icon: FiUser,       label: 'Profile',      to: '/profile' },
  { icon: FiInfo,       label: 'About',        to: '/about' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector(s => s.ui)
  const { isConnected } = useSelector(s => s.web3)
  const location = useLocation()

  return (
    <aside className={`
      fixed top-0 left-0 h-full w-64 z-40
      glass border-r border-white/5
      flex flex-col
      transition-transform duration-300 ease-in-out
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <FiShield size={16} className="text-dark-900" />
          </div>
          <span className="font-display text-base font-bold gradient-text">SKILLCHAIN</span>
        </NavLink>
        <button
          onClick={() => dispatch(setSidebarOpen(false))}
          className="lg:hidden text-gray-500 hover:text-neon-cyan transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => dispatch(setSidebarOpen(false))}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium
              transition-all duration-200 group relative overflow-hidden
              ${isActive
                ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-neon-cyan/5 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon size={17} className="relative z-10 flex-shrink-0" />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-cyan" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — chain status */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono
          ${isConnected
            ? 'bg-neon-green/5 border border-neon-green/20 text-neon-green'
            : 'bg-white/5 border border-white/10 text-gray-500'
          }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-neon-green' : 'bg-gray-600'}`} />
          {isConnected ? 'Polygon Amoy Testnet' : 'Chain Not Connected'}
        </div>
        <p className="text-center text-gray-600 text-[10px] font-mono mt-2">v1.0.0 · SkillChain Protocol</p>
      </div>
    </aside>
  )
}
